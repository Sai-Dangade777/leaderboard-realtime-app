import { useEffect, useState } from 'react'
import { getLeaderboard } from '../services/api'
import { socket } from '../socket'
import Avatar from './Avatar'
import { formatNumber, rankColor } from '../utils/format'
import Countdown from './Countdown'
import ThemeBackground from './ThemeBackground'
import { shieldSvg, trophySvg, rewardsSvg, backgroundStyles } from '../utils/images'

export default function Leaderboard(){
  const [items,setItems] = useState([])
  const [page,setPage] = useState(1)
  const [limit,setLimit] = useState(10)
  const [total,setTotal] = useState(0)
  const [windowKey,setWindowKey] = useState('all')
  const [theme, setTheme] = useState('gold') // gold, orange, purple

  async function load(p=page,l=limit,w=windowKey){
    const data = await getLeaderboard({ page:p, limit:l, window:w })
    setItems(data.items)
    setTotal(data.total)
  }

  useEffect(()=>{ load(1,limit,windowKey); setPage(1) }, [limit, windowKey])

  useEffect(()=>{
    function handle(){ load(1,limit,windowKey) }
    socket.on('leaderboard:changed', handle)
    return ()=> socket.off('leaderboard:changed', handle)
  }, [limit, windowKey])

  // Set theme based on windowKey for visual variety
  useEffect(() => {
    const themeMap = {
      'all': 'gold',
      'daily': 'orange',
      'weekly': 'purple',
      'monthly': 'gold'
    }
    setTheme(themeMap[windowKey] || 'gold')
  }, [windowKey])

  const pages = Math.max(1, Math.ceil(total/limit))
  const currentTheme = backgroundStyles[theme] || backgroundStyles.gold

  return (
    <div className="card theme-container">
      <ThemeBackground theme={theme} />
      <div className="wealth-header" style={{background: currentTheme.bg, color: currentTheme.color}}>
        <div className="topline">
          <div className="wealth-tabs">
            <span className={windowKey==='all'?'active':''} onClick={()=>setWindowKey('all')}>Wealth Ranking</span>
          </div>
          <button className="rewards">🎁 Rewards</button>
        </div>
        <div className="segmented">
          {['daily','monthly'].map(k => (
            <button key={k} className={windowKey===k?'active':''} onClick={()=> setWindowKey(k)}>
              {k[0].toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>
        <div className="hero">
          <div className="hero-img" style={{backgroundImage: `url(${currentTheme.heroImg})`}}></div>
        </div>
        <div className="settlement">Settlement time <Countdown windowKey={windowKey==='all'?'monthly':windowKey} /></div>
      </div>

      {/* tabs */}
      <div className="tabs" style={{marginTop:8}}>
        {['all','daily','weekly','monthly'].map(k => (
          <div key={k} className={`tab ${windowKey===k?'active':''}`} onClick={()=> setWindowKey(k)}>
            {k[0].toUpperCase()+k.slice(1)}
          </div>
        ))}
        <div style={{marginLeft:'auto'}}>
          <span className="muted" style={{marginRight:6}}>Rows:</span>
          <select className="select" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
            {[5,10,20,50].map(n=> <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* podium top 3 */}
      {items.length > 0 && (
        <div className="podium-wealth">
          {items.slice(0,3).map((it,idx) => (
            <div key={it.id} className={`podium-card ${idx===1?'center':''} rank-${Math.min(it.rank,3)}`}>
              {idx === 0 && <div className="winner-medal">1</div>}
              <div style={{display:'grid',placeItems:'center',marginTop:6}}>
                <Avatar name={it.name} size={72} />
              </div>
              <div style={{marginTop:8,fontWeight:800}}>{it.name}</div>
              <div className="muted-num" style={{opacity:.85}}>{formatNumber(it.totalPoints)} pts</div>
            </div>
          ))}
        </div>
      )}

      <div className="leaderboard-list">
        {items.slice(3).map(it => (
          <li key={it.id}>
            <div className="user-info">
              <span className="rank">#{it.rank}</span>
              <Avatar name={it.name} size={36} />
              <span>{it.name}</span>
            </div>
            <div className="points">{formatNumber(it.totalPoints)} <span className="trophy">🏆</span></div>
          </li>
        ))}
        {items.length<=3 && <li className="muted">Scroll for more once there are more than 3 users.</li>}
      </div>

      <div className="row" style={{justifyContent:'space-between',marginTop:10}}>
        <button className="btn" onClick={()=>{ const p=Math.max(1,page-1); setPage(p); load(p,limit) }} disabled={page<=1}>Prev</button>
        <span className="muted">Page {page} / {pages}</span>
        <button className="btn" onClick={()=>{ const p=Math.min(pages,page+1); setPage(p); load(p,limit) }} disabled={page>=pages}>Next</button>
      </div>
    </div>
  )
}
