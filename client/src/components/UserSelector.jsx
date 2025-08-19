import { useEffect, useState } from 'react'
import { getUsers, claimPoints } from '../services/api'

export default function UserSelector({ onClaimed, refreshKey }){
  const [users,setUsers] = useState([])
  const [selected,setSelected] = useState('')
  const [busy,setBusy] = useState(false)

  async function load(){
    const data = await getUsers({ page:1, limit:100 })
    setUsers(data.items)
    if(!selected && data.items.length) setSelected(data.items[0]._id)
  }

  useEffect(()=>{ load() }, [refreshKey])

  const claim = async ()=>{
    if(!selected) return
    setBusy(true)
    try{
      const res = await claimPoints(selected)
      onClaimed?.(res)
    }catch(e){
      alert('Claim failed')
    }finally{ setBusy(false) }
  }

  return (
    <div className="row">
      <select className="select" value={selected} onChange={e=>setSelected(e.target.value)}>
        {users.map(u=> (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>
      <button className="btn" onClick={claim} disabled={busy}>Claim</button>
    </div>
  )
}
