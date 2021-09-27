import React from 'react';
import './chart-control.less';
import { observer, inject } from 'mobx-react';
import { onSnapshot } from 'mobx-state-tree';

import DateTimeTitle from '../../DateTimeTitle.jsx';
import Inside from './Inside.js';
import FirealarmNumber from '../../charts/FirealarmNumber.jsx';
import ModulePanel from './ModulePanel.js';
import Panel from '../../module/map-panel/Panel.js';
import SafetyIndex from '../../module/safety-index/SafetyIndex.js';
import EventList from '../../module/event-list/EventList.js';
import SystemStatus from '../../module/system-status/SystemStatus.js';
import PieChart from '../../module/charts/PieChart.js';
import ImportantArea from '../../module/important-area/ImportantArea.js';
import TodayScheduling from '../../module/today-scheduling/TodayScheduling.js';

class PanelInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      build: {
        label: '',
        floorCount: ''
      }
    };
    this.enterFloorClick = this.enterFloorClick.bind(this);
  }

  setData(data) {
    this.setState({ build: { ...data } });
  }

  enterFloorClick() {
    if (this.props.onClick instanceof Function) {
      this.props.onClick(this.state.build);
    }
  }

  render() {
    return (
      <div className={'build-tooltip-wrap'}>
        <div className={'build-tooltip-item'}>
          <div className={'item-label'}>楼号</div>
          <div className={'item-sign'}>:</div>
          <div className={'item-value'}>{this.state.build.label}</div>
        </div>
        <div className={'build-tooltip-item'}>
          <div className={'item-label'}>总层数</div>
          <div className={'item-sign'}>:</div>
          <div className={'item-value'}>{this.state.build.floorCount ? this.state.build.floorCount + '层' : ''}</div>
        </div>
        <div className={'build-tooltip-button'} onClick={this.enterFloorClick}>进入楼层</div>
      </div>
    );
  }
};

@inject("store")
@observer
class ChartControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPageIndex: 0,
      build: { label: '', floorCount: '', building: '', floor: 100 }
    };
    this.onFloorSelect = this.onFloorSelect.bind(this);
    this.setFloorSelect = this.setFloorSelect.bind(this);

    this.changeScale = this.changeScale.bind(this);

    this.enterFloorClick = this.enterFloorClick.bind(this);
  }

  setBuild(build) {
    this.modulePanelRef.setData(build);
    this.panelInfoRef.setData(build);
  }

  enterFloorClick(build) {
    const { building, name, floor = 100 } = build;
    if (this.props.enterFloorClick instanceof Function) {
      this.props.enterFloorClick({ value: building, name }, { value: floor });
    }
  }

  setPageIndex(index, callback) {
    this.setState({ currentPageIndex: +index }, () => {
      if (index && callback instanceof Function) callback();
    });
  }

  onFloorSelect(build, floor) {
    if (this.props.selectConfirm instanceof Function) this.props.selectConfirm(build, floor);
  }

  setFloorSelect(building, floor) {
    this.insideRef.setFloorSelect(building, floor);
  }

  getPageIndex() {
    return this.state.currentPageIndex;
  }

  changeScale() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scaleX = width / 1920;
    const scaleY = height / 1080;
    let scale = scaleX < scaleY ? scaleX : scaleY;
    const domLeft = document.querySelector('#page-3d-panel-left');
    if (domLeft) {
      domLeft.style.transform = `scale(${scale})`;
      domLeft.style.transformOrigin = 'left top';
    }

    const domRight = document.querySelector('#page-3d-panel-right');
    if (domRight) {
      domRight.style.transform = `scale(${scale})`;
      domRight.style.transformOrigin = 'right top';
    }
  }

  componentDidUpdate() {
    if (this.buildRef && !this.buildRef.getData().label) {
      this.buildRef.setData(this.buildingArray);
      this.floorRef.setData(this.floorDist[this.buildingArray[0].value]);
    }
    this.changeScale();
  }

  componentDidMount() {
    window.addEventListener('resize', this.changeScale);
    this.changeScale();
  }

  render() {
    const { store } = this.props;
    let alarmDevices = store.device.fireAlarms();

    return (
      <div className={'page-3d-wrap'}>
        <div className={'page-3d-header'}>
          <div className={'header-left'}>
            <div className='title-logo' />
            <DateTimeTitle />
          </div>
          <div className={'header-center'}>
            <div className="page-title">{store.user.tenantName}</div>
          </div>
          <div className={'header-right'}>
            <div className={'user-wrap'}>
              <div className='user-icon' />
              <div className='user-name'>{store.user.name}</div>
            </div>
            <div className={'fire-num-wrap'}>
              <div className='fire-icon' />
              <div className='fire-num'>
                <FirealarmNumber num={alarmDevices.length} />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: this.state.currentPageIndex === 0 ? 'block' : 'none'
        }}>
          <div id={'page-3d-panel-left'} style={{ paddingTop: 100 }}>
            <Panel title={'消防安全指数'} className={'panel-style1'} style={{
              left: 20
            }}>
              <SafetyIndex />
            </Panel>
            <Panel title={'今日消防事件'} className={'panel-style2'} style={{
              left: 20, marginTop: 35
            }}>
              <EventList />
            </Panel>
            <Panel title={'重点关注区域'} className={'panel-style2'} style={{
              left: 20, marginTop: 35
            }}>
              <ImportantArea />
            </Panel>
            <Panel title={'今日消防岗位'} className={'panel-style2'} style={{
              left: 20, marginTop: 35
            }}>
              <TodayScheduling />
            </Panel>
          </div>

          <div id={'page-3d-panel-right'}>
            <Panel title={'消防系统运行状态'} type={'right'} className={'panel-style3'} style={{
              position: 'absolute', right: 20, top: 100
            }}>
              <SystemStatus />
            </Panel>
            <Panel title={'消防隐患情况'} type={'right'} className={'panel-style4'} style={{
              position: 'absolute', right: 20, top: 748
            }}>
              <PieChart style={{ width: '100%', height: '100%' }} />
            </Panel>
          </div>

          <ModulePanel ref={refs => this.modulePanelRef = refs} title={'楼层信息'} >
            <PanelInfo ref={refs => this.panelInfoRef = refs} onClick={this.enterFloorClick} />
          </ModulePanel>
        </div>

        <div style={{
          display: this.state.currentPageIndex === 1 ? 'block' : 'none'
        }}>
          <Inside ref={refs => this.insideRef = refs}
            disableCheckbox={true}
            backClick={this.props.backClick}
            onFloorSelect={this.onFloorSelect}
          />
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.changeScale);
  }
};

export default ChartControl;
