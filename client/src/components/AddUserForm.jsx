import { useState } from 'react'
import { addUser } from '../services/api'

export default function AddUserForm({ onAdded }){
  const [name,setName] = useState('')
  const [busy,setBusy] = useState(false)

  const submit = async (e)=>{
    e.preventDefault()
    if(!name.trim()) return
    setBusy(true)
    try{
      const user = await addUser(name.trim())
      setName('')
      onAdded?.(user)
    }catch(e){
      alert(e?.response?.data?.message || 'Failed to add')
    }finally{ setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="row">
      <input className="input" placeholder="Add user name" value={name} onChange={e=>setName(e.target.value)} />
      <button className="btn" disabled={busy}>Add User</button>
    </form>
  )
}
