import { useState } from 'react'
import AddUserForm from './components/AddUserForm'
import UserSelector from './components/UserSelector'
import Leaderboard from './components/Leaderboard'
import ClaimHistory from './components/ClaimHistory'

export default function App(){
  const [lastAward,setLastAward] = useState(null)
  const [refreshKey,setRefreshKey] = useState(0)
  return (
    <div className="container">
      <div className="header">
        <h1 style={{margin:0}}>Leaderboard App</h1>
        {lastAward && (
          <span className="badge" title={new Date().toLocaleTimeString()}>+{lastAward.awarded} to {lastAward.user.name}</span>
        )}
      </div>

      <div className="card" style={{marginBottom:16}}>
        <AddUserForm onAdded={()=>{ setRefreshKey(k=>k+1) }} />
        <div style={{height:12}} />
        <UserSelector refreshKey={refreshKey} onClaimed={(r)=> setLastAward(r)} />
      </div>

      <div className="grid">
        <Leaderboard />
        <ClaimHistory />
      </div>
    </div>
  )
}
