import { useEffect, useState } from 'react'
import { getLeaderboard } from '../services/api'
import { socket } from '../socket'
import Avatar from './Avatar'
import { formatNumber } from '../utils/format'
import Countdown from './Countdown'
import ThemeBackground from './ThemeBackground'
import { shieldSvg, trophySvg, crownSvg, backgroundStyles } from '../utils/images'
import UserSelector from './UserSelector'
import ClaimHistory from './ClaimHistory'

// Navigation tabs at the top of the app
const rankingTypes = [
  { key: 'time', label: 'Time Ranking' },
  { key: 'hourly', label: 'Hourly Ranking' },
  { key: 'family', label: 'Family Ranking' },
  { key: 'wealth', label: 'Wealth Ranking' },
];

export default function Leaderboard(){
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50) // Increased limit to ensure we have all users for the claim section
  const [total, setTotal] = useState(0)
  const [windowKey, setWindowKey] = useState('daily')
  const [rankingType, setRankingType] = useState('wealth')
  const [theme, setTheme] = useState('gold')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [showClaimHistory, setShowClaimHistory] = useState(false)
  const [lastClaimed, setLastClaimed] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  async function load(p=page, l=limit, w=windowKey){
    const data = await getLeaderboard({ page:p, limit:l, window:w })
    setItems(data.items)
    setTotal(data.total)
  }

  // Function to generate different random data based on ranking type
  // This ensures each leaderboard has different users and scores
  const generateRandomData = (rankingType, count) => {
    // List of random names to use for placeholders
    const randomNames = [
      "Alex", "Jordan", "Taylor", "Morgan", "Riley", 
      "Casey", "Avery", "Quinn", "Dakota", "Skyler",
      "Blake", "Reese", "Parker", "Cameron", "Hayden",
      "Peyton", "Rowan", "Harley", "Kai", "Finley",
      "Sydney", "Emerson", "Jamie", "Phoenix", "Sage",
      "Frankie", "Jesse", "Charlie", "Angel", "Elliott"
    ];
    
    // Use a seed based on ranking type to get consistent but different results for each tab
    const seed = rankingType === 'wealth' ? 1000 : 
                 rankingType === 'family' ? 2000 : 
                 rankingType === 'time' ? 3000 : 4000;
    
    return Array.from({ length: count }, (_, idx) => {
      // Get deterministic but different names for each ranking type
      const nameIndex = (seed + idx * 3) % randomNames.length;
      const name = randomNames[nameIndex];
      
      // Generate scores that are different for each ranking type
      const baseScore = (seed + idx * 37) % 5000 + 500;
      
      return {
        id: `${rankingType}-${idx}`,
        name: name,
        totalPoints: baseScore,
        isPlaceholder: true
      };
    });
  };
  
  // Function to ensure we have at least 10 items with random names
  // and ensure they are sorted by score in descending order
  const ensureMinimumItems = (baseItems, minCount = 10) => {
    let items = [...baseItems];
    
    // If we don't have any real items, generate random data based on the ranking type
    if (items.length === 0) {
      items = generateRandomData(rankingType, minCount);
    } 
    // If we have some but not enough items, add more with different data for each tab
    else if (items.length < minCount) {
      const placeholders = generateRandomData(rankingType, minCount - items.length);
      items = [...items, ...placeholders];
    }
    
    // Sort by score (high to low)
    const sortedItems = items.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    
    // Re-assign ranks based on the sorted order
    return sortedItems.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  };
  
  // Process and prepare the leaderboard data
  const getLeaderboardData = () => {
    const sortedUsers = ensureMinimumItems(items, 10);
    
    // Top 3 users (for the podium)
    const topThreeUsers = sortedUsers.slice(0, 3);
    
    // Users ranked 4-10 (for the list view)
    const nextSevenUsers = sortedUsers.slice(3, 10);
    
    return { topThreeUsers, nextSevenUsers };
  };

  useEffect(()=>{ load(1, limit, windowKey); setPage(1) }, [limit, windowKey])

  useEffect(()=>{
    function handle(){ load(1, limit, windowKey) }
    socket.on('leaderboard:changed', handle)
    return ()=> socket.off('leaderboard:changed', handle)
  }, [limit, windowKey])

  // Set theme based on rankingType for visual variety
  useEffect(() => {
    if (rankingType === 'wealth') setTheme('gold');
    else if (rankingType === 'family') setTheme('purple');
    else if (rankingType === 'time') setTheme('blue');
    else setTheme('orange');
    
    // Clear and load new data when ranking type changes
    // This ensures different data for different tabs
    setItems([]);
    load(1, limit, windowKey);
  }, [rankingType, limit, windowKey])
    
  // Handle user claim results
  const handleClaimed = (result) => {
    // Update the last claimed data to show the user feedback
    setLastClaimed({
      ...result,
      awarded: 5 // Ensure we always show +5 points
    });
    
    // Refresh the leaderboard data
    load();
    
    // Reset the claim notification after 5 seconds
    setTimeout(() => {
      setLastClaimed(null);
    }, 5000);
    
    // Refresh the user selector component
    setRefreshKey(prev => prev + 1);
  };

  const currentTheme = backgroundStyles[theme] || backgroundStyles.gold;

  // Responsive design variables
  const isMobile = screenWidth < 600;
  const isTablet = screenWidth >= 600 && screenWidth < 1024;

  return (
    <div className="theme-container" style={{
      background: 
        theme === 'gold' ? '#fff2d9' : 
        theme === 'purple' ? '#f4ebff' : 
        theme === 'blue' ? '#e6f4ff' : 
        '#fff2eb',
      borderRadius: 0,
      padding: 0,
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto',
      boxShadow: isTablet || !isMobile ? '0px 0px 20px rgba(0,0,0,0.1)' : 'none',
    }}>
      <div style={{ 
        padding: isMobile ? '10px 15px' : '15px 25px', 
        background: '#f8f8f8', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0px 2px 5px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: isMobile ? '10px' : '20px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', fontSize: isMobile ? '16px' : '20px' }}>←</span>
          <div className="rank-nav" style={{ 
            overflowX: 'auto', 
            whiteSpace: 'nowrap', 
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            display: 'flex',
            gap: isMobile ? '15px' : '25px'
          }}>
            {rankingTypes.map(type => (
              <div 
                key={type.key} 
                className={`tab ${rankingType === type.key ? 'active' : ''}`}
                onClick={() => setRankingType(type.key)}
                style={{ 
                  borderBottom: rankingType === type.key ? '3px solid #ffba08' : 'none',
                  paddingBottom: '5px',
                  color: rankingType === type.key ? '#000000' : '#666666',
                  fontWeight: rankingType === type.key ? '600' : '400',
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                {type.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          background: '#e6e6e6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>?</div>
      </div>

      <div style={{ 
        padding: isMobile ? '10px 0' : '15px 0', 
        background: '#fff', 
        borderRadius: '20px 20px 0 0', 
        marginTop: '-10px',
        boxShadow: '0px -2px 10px rgba(0,0,0,0.03)'
      }}>
        <div className="segmented" style={{ 
          width: '90%', 
          margin: '0 auto', 
          background: '#eee', 
          borderRadius: '50px',
          display: 'flex',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.05) inset'
        }}>
          <button 
            className={windowKey === 'daily' ? 'active' : ''} 
            onClick={() => setWindowKey('daily')}
            style={{ 
              flex: 1, 
              background: windowKey === 'daily' ? '#fff' : 'transparent',
              padding: isMobile ? '10px' : '12px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: 'bold',
              color: windowKey === 'daily' ? '#000' : '#666',
              fontSize: isMobile ? '14px' : '16px',
              boxShadow: windowKey === 'daily' ? '0px 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Daily
          </button>
          <button 
            className={windowKey === 'monthly' ? 'active' : ''} 
            onClick={() => setWindowKey('monthly')}
            style={{ 
              flex: 1, 
              background: windowKey === 'monthly' ? '#fff' : 'transparent',
              padding: isMobile ? '10px' : '12px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: 'bold',
              color: windowKey === 'monthly' ? '#000' : '#666',
              fontSize: isMobile ? '14px' : '16px',
              boxShadow: windowKey === 'monthly' ? '0px 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Monthly
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'linear-gradient(160deg, #ffefc7 0%, #ffdc89 100%)', 
        padding: isMobile ? '15px 0 25px' : '25px 0 35px',
        position: 'relative',
        boxShadow: '0px 3px 10px rgba(0,0,0,0.05)'
      }}>
        <div className="settlement" style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          color: '#333',
          fontWeight: '600',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          Settlement time <Countdown windowKey={windowKey} />
        </div>
        
        <div className="hero" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '10px 0'
        }}>
          <img 
            src={shieldSvg} 
            alt="Shield with wings" 
            style={{ 
              width: isMobile ? '250px' : '300px', 
              height: isMobile ? '125px' : '150px',
              filter: 'drop-shadow(0px 5px 10px rgba(0,0,0,0.2))'
            }} 
          />
        </div>
        
        <button className="rewards" style={{
          position: 'absolute',
          right: isMobile ? '15px' : '25px',
          top: isMobile ? '15px' : '20px',
          background: 'linear-gradient(135deg, #ff6b6b, #ff4f4f)',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: isMobile ? '5px 10px' : '7px 14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontSize: isMobile ? '13px' : '14px',
        }}>
          🎁 Rewards
        </button>
      </div>

      {/* Top 3 users (podium) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '0.9fr 1.2fr 0.9fr' : '1fr 1.2fr 1fr',
        gap: isMobile ? '8px' : '12px',
        padding: '0 10px',
        marginTop: isMobile ? '-15px' : '-20px'
      }}>
        {/* We display the top 3 users in a specific order: 2nd, 1st, 3rd place */}
        {[1, 0, 2].map((position, idx) => {
          // Get the processed data
          const { topThreeUsers } = getLeaderboardData();
          // Get the user at the specified position 
          // We display in the order: 2nd place (left), 1st place (middle), 3rd place (right)
          const actualUser = topThreeUsers[position];
          const userRank = position + 1; // Actual rank (1st, 2nd, 3rd)
            
            return (
              <div key={actualUser?.id ? `${actualUser.id}-${actualUser.name}` : `top-${position}`} style={{
                background: '#fff',
                borderRadius: '15px',
                padding: isMobile ? '15px 5px 12px' : '20px 10px 15px',
                textAlign: 'center',
                boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
                position: 'relative',
                transform: idx === 1 ? 'translateY(-10px)' : 'none', // 1st place is elevated
                zIndex: idx === 1 ? 2 : 1,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Position indicator for 1st place */}
                {position === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #ffcc00, #ff9900)',
                    width: isMobile ? '28px' : '30px',
                    height: isMobile ? '28px' : '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    border: '2px solid #fff',
                    fontSize: isMobile ? '14px' : '16px'
                  }}>
                    1
                  </div>
                )}
                
                {/* Medals/indicators for each position */}
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  // Different colors for gold (1st), silver (2nd), bronze (3rd)
                  background: position === 0 ? '#ffd700' : position === 1 ? '#c0c0c0' : '#cd7f32',
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  fontSize: isMobile ? '18px' : '20px'
                }}>
                  {position === 0 && "🥇"} {/* 1st place gold medal */}
                  {position === 1 && "🥈"} {/* 2nd place silver medal */}
                  {position === 2 && "🥉"} {/* 3rd place bronze medal */}
                </div>
                
                <div style={{ marginTop: '10px', marginBottom: '5px' }}>
                  <Avatar 
                    name={actualUser?.name || `Player ${userRank}`} 
                    size={isMobile ? 60 : 72} 
                  />
                </div>
                <div style={{ 
                  marginTop: '10px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: isMobile ? '14px' : '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 5px'
                }}>
                  {actualUser?.name || `Player ${userRank}`}
                </div>
                <div style={{ 
                  background: 'linear-gradient(to right, #fff5e6, #ffedcc)',
                  borderRadius: '20px', 
                  padding: isMobile ? '4px 8px' : '5px 10px',
                  margin: '8px auto 0',
                  width: 'fit-content',
                  fontWeight: '700',
                  fontSize: isMobile ? '13px' : '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#333',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  🏆 {formatNumber(actualUser?.totalPoints || 0)}
                </div>
              </div>
            );
          })}
        </div>

      {/* List of other users (4th to 10th place) */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        margin: isMobile ? '12px 10px' : '15px 10px',
        overflow: 'hidden',
        boxShadow: '0 3px 15px rgba(0,0,0,0.05)'
      }}>
        {getLeaderboardData().nextSevenUsers.map((user, idx) => (
          <div key={user.id ? `${user.id}-${user.name}` : `list-user-${idx}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 15px' : '15px 20px',
            borderBottom: idx < 6 ? '1px solid #f0f0f0' : 'none',
            transition: 'background-color 0.15s ease',
            ':hover': {
              backgroundColor: '#f9f9f9'
            }
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#555', 
                width: '24px',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                {user.rank} {/* Display the calculated rank */}
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  name={user?.name || `Player ${user.rank}`} 
                  size={isMobile ? 36 : 40} 
                />
              </div>
              <span style={{ 
                fontWeight: '600', 
                color: '#333',
                fontSize: isMobile ? '14px' : '16px',
                maxWidth: isMobile ? '120px' : '200px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || `Player ${user.rank}`}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: '700',
              color: '#333',
              fontSize: isMobile ? '14px' : '16px',
              background: 'linear-gradient(to right, #fff5e6, #ffedcc)',
              padding: isMobile ? '3px 8px' : '4px 10px',
              borderRadius: '12px'
            }}>
              {formatNumber(user?.totalPoints || 0)} <span style={{ color: '#ffaa00' }}>🏆</span>
            </div>
          </div>
        ))}
        
        {/* Last row showing 999+ users */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '12px 15px' : '15px 20px',
          background: '#f9f9f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
            <span style={{ 
              fontWeight: 'bold', 
              color: '#555', 
              width: '30px',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              999+
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: isMobile ? '36px' : '40px', 
                height: isMobile ? '36px' : '40px', 
                borderRadius: '50%', 
                background: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                <div style={{ 
                  width: isMobile ? '26px' : '30px', 
                  height: isMobile ? '18px' : '20px', 
                  background: 'linear-gradient(45deg, #14b8a6, #0ea5e9)',
                  borderRadius: '3px'
                }}></div>
              </div>
            </div>
            <span style={{ 
              fontWeight: '600',
              color: '#333',
              fontSize: isMobile ? '14px' : '16px' 
            }}>
              Devil
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: '700',
            color: '#333',
            fontSize: isMobile ? '14px' : '16px',
            background: 'linear-gradient(to right, #fff5e6, #ffedcc)',
            padding: isMobile ? '3px 8px' : '4px 10px',
            borderRadius: '12px'
          }}>
            0 <span style={{ color: '#ffaa00' }}>🏆</span>
          </div>
        </div>
      </div>

      {/* Claim Points Section */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        margin: isMobile ? '12px 10px' : '15px 10px',
        padding: isMobile ? '15px' : '20px',
        boxShadow: '0 3px 15px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#333',
          fontSize: isMobile ? '18px' : '20px'
        }}>
          Claim Points
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '15px'
        }}>
          <UserSelector 
            onClaimed={handleClaimed} 
            refreshKey={refreshKey}
            leaderboardUsers={ensureMinimumItems(items, 10)} // Pass all sorted users
          />
          
          {lastClaimed && (
            <div style={{
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease-out',
              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
            }}>
              <span style={{ fontSize: '20px' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Points Claimed!</div>
                <div>{lastClaimed.user.name} received {lastClaimed.awarded} points</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h3 style={{ 
              margin: 0,
              color: '#333',
              fontSize: isMobile ? '18px' : '20px'
            }}>
              Recent Claims
            </h3>
            <button 
              onClick={() => setShowClaimHistory(!showClaimHistory)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4a69ff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showClaimHistory ? 'Hide History' : 'Show All History'}
            </button>
          </div>
          
          {showClaimHistory && <ClaimHistory />}
        </div>
      </div>

      {/* Add padding at the bottom for better spacing */}
      <div style={{ padding: isMobile ? '15px' : '20px' }}></div>
    </div>
  )
}
