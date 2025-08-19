import { useEffect, useState } from 'react'
import { getClaims } from '../services/api'
import { socket } from '../socket'

export default function ClaimHistory(){
  const [items,setItems] = useState([])
  const [page,setPage] = useState(1)
  const [limit,setLimit] = useState(10)
  const [total,setTotal] = useState(0)
  const [windowKey,setWindowKey] = useState('all')

  async function load(p=page,l=limit,w=windowKey){
    const data = await getClaims({ page:p, limit:l, window:w })
    setItems(data.items)
    setTotal(data.total)
  }

  useEffect(()=>{ load(1,limit,windowKey) }, [limit, windowKey])
  useEffect(()=>{
    const h = ()=> load(1,limit,windowKey)
    socket.on('leaderboard:changed', h)
    return ()=> socket.off('leaderboard:changed', h)
  }, [limit, windowKey])

  const pages = Math.max(1, Math.ceil(total/limit))

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>Claim History</h3>
        <div className="row">
          <span className="muted">Rows:</span>
          <select className="select" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
            {[5,10,20,50].map(n=> <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="tabs" style={{marginTop:8, marginBottom:8}}>
        {['all','daily','weekly','monthly'].map(k => (
          <div key={k} className={`tab ${windowKey===k?'active':''}`} onClick={()=> setWindowKey(k)}>
            {k[0].toUpperCase()+k.slice(1)}
          </div>
        ))}
      </div>

      <ul className="list" style={{marginTop:10}}>
        {items.map(it => (
          <li key={it.id}>
            <div>
              <strong>{it.userName}</strong>
              <div className="muted" style={{fontSize:12}}>{new Date(it.createdAt).toLocaleString()}</div>
            </div>
            <div className="badge">+{it.points}</div>
          </li>
        ))}
        {items.length===0 && <li className="muted">No claims yet.</li>}
      </ul>

      <div className="row" style={{justifyContent:'space-between',marginTop:10}}>
        <button className="btn" onClick={()=>{ const p=Math.max(1,page-1); setPage(p); load(p,limit) }} disabled={page<=1}>Prev</button>
        <span className="muted">Page {page} / {pages}</span>
        <button className="btn" onClick={()=>{ const p=Math.min(pages,page+1); setPage(p); load(p,limit) }} disabled={page>=pages}>Next</button>
      </div>
    </div>
  )
}
