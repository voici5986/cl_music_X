import React, { useEffect, useState } from 'react';
import { useRegion } from '../contexts/RegionContext';
import { Button } from 'react-bootstrap';
import { FaGlobe, FaGlobeAsia, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/RegionStatus.css';

/**
 * 区域状态指示器组件
 * 显示当前的应用模式和区域信息
 * @param {boolean} showDetails - 是否显示详细信息
 * @param {boolean} iconOnly - 是否只显示图标（适用于移动端）
 */
const RegionStatus = ({ showDetails = false, iconOnly = false }) => {
  const { appMode, isLoading, refreshRegionDetection, APP_MODES } = useRegion();
  const [showBanner, setShowBanner] = useState(true);
  
  // 添加调试日志，查看当前模式
  useEffect(() => {
    console.log(`RegionStatus: 当前模式 = ${appMode}`);
  }, [appMode]);
  
  // 当应用模式改变时，显示状态栏
  useEffect(() => {
    setShowBanner(true);
    
    // 如果是完整模式，5秒后自动隐藏
    if (appMode === APP_MODES.FULL) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [appMode, APP_MODES.FULL]);
  
  // 获取模式图标
  const getModeIcon = () => {
    switch (appMode) {
      case APP_MODES.FULL:
        return <FaGlobe className="mode-icon full" />;
      case APP_MODES.CHINA:
        return <FaGlobeAsia className="mode-icon china" />;
      case APP_MODES.OFFLINE:
        return <FaExclamationTriangle className="mode-icon offline" />;
      default:
        return <FaWifi className="mode-icon loading pulse" />;
    }
  };
  
  // 获取模式名称
  const getModeName = () => {
    switch (appMode) {
      case APP_MODES.FULL:
        return '完整模式';
      case APP_MODES.CHINA:
        return '中国模式';
      case APP_MODES.OFFLINE:
        return '离线模式';
      default:
        return '加载中...';
    }
  };
  
  // 获取模式描述
  const getModeDescription = () => {
    switch (appMode) {
      case APP_MODES.FULL:
        return '所有功能可用';
      case APP_MODES.CHINA:
        return '服务不可用';
      case APP_MODES.OFFLINE:
        return '当前处于离线模式，仅可访问已缓存的内容';
      default:
        return '正在检测区域...';
    }
  };
  
  // 图标模式（仅图标）
  if (iconOnly) {
    return (
      <div className={`region-status-icon-only ${appMode}`} title={getModeName()}>
        {getModeIcon()}
      </div>
    );
  }
  
  // 简洁模式（图标和名称）
  if (!showDetails) {
    return (
      <div className={`region-status-compact ${appMode} ${showBanner ? 'visible' : 'hidden'}`}
           onMouseEnter={() => setShowBanner(true)}
           onMouseLeave={() => { 
             if (appMode === APP_MODES.FULL) {
               const timer = setTimeout(() => setShowBanner(false), 3000);
               return () => clearTimeout(timer);
             }
           }}
      >
        {getModeIcon()}
        <span className="mode-name">{getModeName()}</span>
        {appMode === APP_MODES.OFFLINE && 
          <span className="mode-description">当前处于离线模式，仅可访问已缓存的内容</span>
        }
      </div>
    );
  }
  
  // 详细模式（包含描述和刷新按钮）
  return (
    <div className={`region-status-detailed ${appMode}`}>
      <div className="status-header">
        {getModeIcon()}
        <h5 className="mode-name">{getModeName()}</h5>
      </div>
      
      <p className="mode-description">{getModeDescription()}</p>
      
      {appMode === APP_MODES.CHINA && (
        <p className="region-note">
          因法律风险，本服务不对IP为中国大陆地区的用户开放。
          {navigator.onLine && (
            <span> 如果您正在使用VPN，可以尝试刷新检测。</span>
          )}
        </p>
      )}
      
      {appMode === APP_MODES.OFFLINE && (
        <p className="region-note">
          您当前处于离线状态，仅可访问已缓存的内容。请检查网络连接后刷新页面。
        </p>
      )}
      
      <Button 
        variant="primary"
        size="sm"
        className="refresh-button"
        onClick={refreshRegionDetection}
        disabled={isLoading}
      >
        {isLoading ? '检测中...' : '刷新检测'}
      </Button>
    </div>
  );
};

export default RegionStatus; 