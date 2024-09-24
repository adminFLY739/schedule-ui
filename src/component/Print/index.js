import React from 'react'
import { inject } from 'mobx-react'
import { Form,notification,Drawer,Spin,Switch,Tooltip,Input,InputNumber,Modal,TimePicker,DatePicker,Select,Tabs,Button,Table,message } from 'antd'
import { API_SERVER } from '../../constant/apis'
import moment from 'moment'
import style1 from './style.less';
import * as urls from '../../constant/urls'
import {debug,isN} from '../../util/fn'

@inject('mainStore')
class Print extends React.Component {
    constructor(props) {
        super(props)
        this.store = this.props.mainStore
        this.state = {
        loading: false,
        cls:this.props.cls,
        partList: [1,1,1],
        selMenu: 0,
        tecList: this.props.tecList,
        expList: this.props.expList,
        showDlgT: false,
        showDlgE: false,
        batchT: {week:16},
        batchE: {week:16,gnum:1,type:'验证',prop:'必做'},
        week:16,
        time:new Date(),
        clsDetail:this.props.clsDetail
        }

    }
    
  render(){
    let {cls,funList,partList,selMenu,tecList,expList,clsDetail} = this.state
    const PATH=`https://mqcai.top/img/digital/${cls.uid}.jpg`;

      return(
        <div className="g-print">
          <div className="g-sysa1">
            <div className="m-bd">            
              <div className="m-tab_cnt">
                <Form className="m-form" layout="horizontal" >
                  <div className="m-hd">


                  <div className="m-term">{cls?.term}学年</div>
                    <div className="m-title">
                      <span>{cls?.name}</span>
                      <span>{cls?.ename}</span>
                    </div>
                    <div className="m-info">
                      <span>{cls?.cform}</span>
                      <span>{cls?.cprop}</span>
                      <span>{cls?.web}</span>
                    </div>

                  </div>

                  <>
                    <div className={((selMenu==0)||(selMenu==1))?"m-main":"m-main fn-hide"} >
                      <div className="m-tl">基本信息</div>

                      <div className="m-sect">
                        <div className="m-item">
                          <label>授课校区</label>
                          <label>{cls?.pos}</label>
                        </div>
                        <div className="m-item">
                          <label>开课学院</label>
                          <label>{cls?.col}</label>
                        </div>
                        <div className="m-item">
                          <label>课程学分</label>
                          <label>{cls?.mark}</label>
                        </div>
                        <div className="m-item">
                          <label>教学周期</label>
                          <label>{cls?.week}</label>
                        </div>
                      </div>

                      <div className="m-sect">
                        <div className="m-item">
                          <label>理论课时</label>
                          <label>{cls.t_hour}</label>
                        </div>
                        <div className="m-item">
                          <label>实验课时</label>
                          <label>{cls.e_hour}</label>
                        </div>
                        <div className="m-item">
                          <label>周学时数</label>
                          <label>{cls?.w_hour}</label>
                        </div>
                        <div className="m-item">
                          <label>总课时数</label>
                          <label>{cls?.a_hour}</label>
                        </div>
                      </div>

                      <div className="m-sect">
                        <div className="m-item">
                          <label>主讲教师</label>
                          <label>{cls.m_tech}</label>
                        </div>
                        <div className="m-item">
                          <label>辅导教师</label>
                          {cls.s_tech=='' && <label>无</label>}
                          {cls.s_tech!='' && <label>{cls.s_tech}</label>}
                        </div>
                        <div className="m-item">
                          <label>答疑时间</label>
                          {cls.q_time=='' && <label>无</label>}
                          {cls.q_time!='' && <label>{cls.q_time}</label>}
                        </div>
                        <div className="m-item">
                          <label>答疑地点</label>
                          {cls.q_addr=='' && <label>无</label>}
                          {cls.q_addr!='' && <label>{cls.q_addr}</label>}
                        </div>
                      </div>
                      

                      {(cls?.web)&&
                      <div className="m-sect">
                        <div className="m-item">
                          <label>教学网站</label>
                          {cls.url=='' && <label>无</label>}
                          {cls.url!='' && <label>{cls.url}</label>}
                        </div>
                        <div className="m-item">
                          <label>点击次数</label>
                          {cls.click=='' && <label>无</label>}
                          {cls.click!='' && <label>{cls.click}</label>}
                        </div>
                        <div className="m-item">
                          <label>账号名称</label>
                          {cls.usr=='' && <label>无</label>}
                          {cls.usr!='' && <label>{cls.usr}</label>}
                        </div>
                        <div className="m-item">
                          <label>登录密码</label>
                          {cls.pwd=='' && <label>无</label>}
                          {cls.pwd!='' && <label>{cls.pwd}</label>}
                        </div>
                      </div>}
                    </div>

                    <div className={((selMenu==0)||(selMenu==1))?"m-main":"m-main fn-hide"}>
                      <div className="m-tab-teach">
                      <div className="m-row" >
                            <span>教学班级</span>
                            <span>学生人数</span>
                            <span>教学时间</span>
                            <span>教学地点</span>
                        </div>
                      {clsDetail.map((item,i)=>
                          <div className="m-row" key={i}>
                            <span>{item.cls}</span>
                            <span>{item.st_num}</span>
                            <span>{item.wt}</span>
                            <span>{item.addr}</span>
                          </div>
                        )}
                      
                      </div>
                    </div>

                    <div className={((selMenu==0)||(selMenu==1))?"m-main":"m-main fn-hide"}>
                      <div className="m-tab">
                        <label>课程描述及与其他课程关系</label>
                        <div>{cls.desc}</div>
                        <label>使用教材与参考书目</label>
                        <div>{cls.mate}</div>
                        <label>课程考核</label>
                        <div>{cls.exam}</div>
                        <label>教学方法与手段及相关要求</label>
                        <div>{cls.method}</div>
                      </div>
                    </div>
                  </>
  
                  <div className={((selMenu==0)||(selMenu==2))?"m-main":"m-main fn-hide"} style={{'margin':'35px 0 0 0'}}>
                    <div className="m-tl">教学进度</div>
                    <div className="m-tech">
                      <div className="m-row-t">
                        <span className="fn-hide"></span>
                        <span>主要教学内容</span>
                        <span>教学形式及内容资料</span>
                        <span>作业与辅导安排</span>
                      </div>

                      {(tecList.length==0)&&<div className="m-row-t">
                        <span>无</span>
                          <span>无</span>
                          <span>无</span>
                      </div>}

                      {tecList.map((item,i)=>
                        <div className="m-row-t" key={i}>
                          <span>{item.cnt}</span>
                          <span>{item.method}</span>
                          <span>{item.task}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={((selMenu==0)||(selMenu==3))?"m-main":"m-main fn-hide"}  style={{'margin':'35px 0 0 0'}}>
                    <div className="m-tl">实验进度</div>
                    <div className="m-tech">
                      <div className="m-row-e">
                        <span className="fn-hide"></span>
                        <span>实验项目名称</span>
                        <span>实验性质</span>
                        <span>实验要求</span>
                        <span>实验教室</span>
                        <span>每组人数</span>
                      </div>
                      {(expList.length==0)&&<div className="m-row-e">
                          <span>无</span>
                          <span>无</span>
                          <span>无</span>
                          <span>无</span>
                          <span>无</span>
                          </div>}

                      {expList.map((item,i)=>
                        <div className="m-row-e" key={i}>
                          <span>{item.name}</span>
                          <span>{item.type}</span>
                          <span>{item.prop}</span>
                          <span>{item.addr}</span>
                          <span>{item.gnum}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </Form>
              </div>
              
              <div className='m-time-sign'>
                <span>填表日期:</span>
                <span>{moment().format('YYYY-MM-DD')}</span>
              </div>
              <div className='m-time-sign'>
                <span>教师签名:</span>
                <span>{cls.m_tech}</span>
                {/* <span><img src={PATH}/></span> */}
              </div>
              {(cls.length==0)&&<div className="m-tab_none"></div>}
              
            </div>
          </div> 
        </div>

        )
    }
}

export default Print;