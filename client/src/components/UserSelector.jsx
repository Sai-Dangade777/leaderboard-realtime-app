import { useEffect, useState } from 'react'
import { getUsers, claimPoints, bulkCreateUsers } from '../services/api'
import { formatNumber } from '../utils/format'

export default function UserSelector({ onClaimed, refreshKey, leaderboardUsers }){
  const [users,setUsers] = useState([])
  const [selected,setSelected] = useState('')
  const [busy,setBusy] = useState(false)



  async function load() {
    // If leaderboardUsers are provided, ensure all exist in DB and load from DB
    if (leaderboardUsers && leaderboardUsers.length > 0) {
      try {
        // Filter out empty and duplicate names
        const names = Array.from(new Set(leaderboardUsers.map(u => u.name).filter(Boolean)));
        if (names.length === 0) {
          setUsers([]);
          return;
        }
        await bulkCreateUsers(names);
        // Now fetch all users from DB
        const data = await getUsers({ page: 1, limit: 100 });
        // Map leaderboard users to DB users by name
        const dbUsers = data.items;
        const updatedUsers = leaderboardUsers.map(lu => {
          const dbUser = dbUsers.find(u => u.name === lu.name);
          return dbUser ? { ...lu, _id: dbUser._id, totalPoints: dbUser.totalPoints } : null;
        }).filter(Boolean); // Only keep users with valid DB IDs
        setUsers(updatedUsers);
        if (!selected && updatedUsers.length) {
          setSelected(updatedUsers[0]._id);
        }
      } catch (error) {
        console.error('Error ensuring users exist:', error);
        alert('Error loading users. Please try again.');
      }
      return;
    }
    // Fallback to fetching users if no leaderboard users provided
    const data = await getUsers({ page: 1, limit: 100 });
    setUsers(data.items);
    if (!selected && data.items.length) {
      setSelected(data.items[0]._id);
    }
  }

  useEffect(() => { 
    load();
  }, [refreshKey, leaderboardUsers]);

  const [lastClaimTime, setLastClaimTime] = useState({});

  const claim = async () => {
    if (!selected) {
      alert('Please select a user first');
      return;
    }

    // Check if user has claimed in the last minute
    const now = Date.now();
    const lastClaim = lastClaimTime[selected] || 0;
    const timeSinceLastClaim = now - lastClaim;

    if (timeSinceLastClaim < 60000) { // 1 minute cooldown
      const remainingSeconds = Math.ceil((60000 - timeSinceLastClaim) / 1000);
      alert(`Please wait ${remainingSeconds} seconds before claiming again`);
      return;
    }

    setBusy(true);
    try {
      const selectedUser = users.find(u => u._id === selected);
      if (!selectedUser) {
        throw new Error('Selected user not found');
      }

      const res = await claimPoints(selected);
      
      // Update last claim time for this user
      setLastClaimTime(prev => ({
        ...prev,
        [selected]: now
      }));
      
      onClaimed?.({
  user: selectedUser,
  awarded: res.awarded || 5, // Use actual awarded points from backend
  ...res
      });
      
      // Reload the users list to get updated points
      load();
      
    } catch (e) {
      console.error('Claim error:', e);
      if (e.response?.status === 404) {
        alert('User not found. Please try selecting another user.');
      } else {
        alert('Failed to claim points. Please try again later.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
      <select 
        value={selected} 
        onChange={e=>setSelected(e.target.value)}
        style={{
          flex: 1,
          padding: '10px 15px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          background: 'white',
          fontSize: '16px',
          color: '#333',
          cursor: 'pointer'
        }}
      >
        <option value="">Select a user</option>
        {users.map(u=> (
          <option key={u._id ? `${u._id}-${u.name}` : u.name} value={u._id}>
            {u.name} ({formatNumber(u.totalPoints || 0)} points)
          </option>
        ))}
      </select>
      <button 
        onClick={claim} 
        disabled={busy}
        style={{
          padding: '10px 20px',
          background: busy ? '#cccccc' : 'linear-gradient(135deg, #4a69ff, #2845e5)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: busy ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {busy ? 'Claiming...' : 'Claim Points'}
      </button>
    </div>
  )
}
