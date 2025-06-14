import React, { useState, useEffect } from 'react';
import { Button, Card, Image, Spinner, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, getHistory, getSyncStatus, saveSyncStatus } from '../services/storage';
import { FaHeart, FaHistory, FaSignOutAlt, FaSync } from 'react-icons/fa';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { currentUser, signOut } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState({ 
    loading: false, 
    success: null, 
    message: '', 
    timestamp: null 
  });
  
  // 加载同步状态
  const loadSyncStatus = async () => {
    if (currentUser) {
      const savedStatus = await getSyncStatus(currentUser.uid);
      setSyncStatus(savedStatus);
    }
  };
  
  useEffect(() => {
    loadCounts();
    loadSyncStatus();
  }, [currentUser]); // 添加currentUser作为依赖
  
  // 更新同步状态并保存到缓存
  const updateSyncStatus = async (newStatus) => {
    setSyncStatus(newStatus);
    if (currentUser) {
      await saveSyncStatus(newStatus, currentUser.uid);
    }
  };
  
  const loadCounts = async () => {
    const favorites = await getFavorites();
    const history = await getHistory();
    setFavoritesCount(favorites.length);
    setHistoryCount(history.length);
  };
  
  const handleManualSync = async () => {
    if (!currentUser) return;
    
    await updateSyncStatus({ loading: true, success: null, message: '正在数据同步...', timestamp: null });
    
    try {
      const { initialSync } = await import('../services/syncService');
      const result = await initialSync(currentUser.uid);
      
      if (result.success) {
        await updateSyncStatus({ 
          loading: false, 
          success: true, 
          message: '数据同步成功', 
          timestamp: new Date() 
        });
        loadCounts(); // 更新计数
      } else {
        await updateSyncStatus({ 
          loading: false, 
          success: false, 
          message: `同步失败: ${result.error || '未知错误'}`, 
          timestamp: new Date() 
        });
      }
    } catch (error) {
      await updateSyncStatus({ 
        loading: false, 
        success: false, 
        message: `同步错误: ${error.message}`, 
        timestamp: new Date() 
      });
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };
  
  if (!currentUser) {
    return null;
  }
  
  const userInitial = currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 
                     (currentUser.email ? currentUser.email[0].toUpperCase() : '?');
  
  // 格式化时间
  const formatTime = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 渲染同步状态
  const renderSyncStatus = () => {
    const timeString = syncStatus.timestamp ? formatTime(syncStatus.timestamp) : '未同步';
    let statusClass = '';
    let statusText = '';
    
    if (syncStatus.loading) {
      statusClass = 'info';
      statusText = `正在同步: ${syncStatus.message}`;
    } else if (syncStatus.success === true) {
      statusClass = 'success';
      statusText = `同步成功: ${timeString}`;
    } else if (syncStatus.success === false) {
      statusClass = 'danger';
      statusText = `同步失败: ${timeString}`;
    } else {
      statusClass = 'secondary';
      statusText = '未同步';
    }
    
    return (
      <div className="sync-status-container">
        <div className={`sync-status ${statusClass}`}>
          {statusText}
        </div>
      </div>
    );
  };
  
  return (
    <div className="user-profile-container">
      <Container>
        <div className="user-dashboard">
          {/* 用户资料卡片 */}
          <Card className="profile-card">
      <Card.Body>
              <div className="avatar-container">
          {currentUser.photoURL ? (
            <Image 
              src={currentUser.photoURL} 
              roundedCircle 
                    className="user-avatar"
            />
          ) : (
                  <div className="avatar-initial rounded-circle d-flex justify-content-center align-items-center">
              {userInitial}
            </div>
          )}
          </div>
              <div className="user-info">
                <h3 className="user-name">{currentUser.displayName || '用户'}</h3>
                <p className="user-email">{currentUser.email}</p>
          <Button 
            variant="outline-danger" 
                  className="logout-button w-100 mt-2"
            onClick={handleLogout}
          >
                  <FaSignOutAlt className="me-2" /> 退出登录
          </Button>
        </div>
            </Card.Body>
          </Card>
          
          {/* 统计卡片 */}
          <Card className="stats-card">
            <Card.Body>
              <div className="stats-item">
                <div className="stats-icon favorites">
                  <FaHeart />
                </div>
                <div className="stats-content">
                  <div className="stats-value">{favoritesCount}</div>
                  <p className="stats-label">收藏的歌曲</p>
                </div>
        </div>
        
              <div className="stats-item">
                <div className="stats-icon history">
                  <FaHistory />
                </div>
                <div className="stats-content">
                  <div className="stats-value">{historyCount}</div>
                  <p className="stats-label">历史记录</p>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* 同步卡片 */}
          <Card className="sync-card">
            <Card.Body>
              {renderSyncStatus()}
          <Button 
                variant="primary" 
            onClick={handleManualSync}
            disabled={syncStatus.loading}
                className="sync-button w-100"
          >
            {syncStatus.loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
            ) : (
                  <><FaSync className="me-2" /> 同步数据</>
            )}
          </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default UserProfile; 