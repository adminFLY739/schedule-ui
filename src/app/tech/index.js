import React from 'react'
import { inject } from 'mobx-react'
import { Form,notification,Drawer,Spin,Switch,Tooltip,Input,InputNumber,Modal,TimePicker,DatePicker,Select,Tabs,Button,Table,message } from 'antd'
import { API_SERVER } from '../../constant/apis'
import moment from 'moment'
import dayjs from 'dayjs'
import style from './style.less';
import * as urls from '../../constant/urls'
import {debug,isN} from '../../util/fn'
import UploadImg from '../../component/UploadImg'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'
import Print from '../../component/Print'
import fileToBlob from '@/util/fileToBlob';
const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input
const { confirm } = Modal
const { TextArea } = Input

import icon_img from "../../img/icon_img.svg"
import icon_add from "../../img/icon_add.svg"
import icon_del from "../../img/icon_del.svg"


const formatDt=(d,t)=>{
  d = d.replaceAll('-','')
  t = t.replaceAll(':','')
  return parseInt(`${d}${t}`)
}

const menuList = ['全部','基本信息','教学进度','实验进度']



@inject('mainStore')
class Tech extends React.Component {
  
  constructor(props) {
    super(props)
    this.formRef = React.createRef();
    this.store = this.props.mainStore
    this.state = {
      loading: false,
      clsDetail:[],
      partList: [1,1,1],
      selMenu: 0,
      tecList: [],
      expList: [],
      showDlgT: false,
      showDlgE: false,
      batchT: {week:16,hour:1},
      batchE: {week:16,hour:1,gnum:1,type:'验证',prop:'必做'},
      week:16,
      showprint:false,
      term:'',
      oldterm:'',
      isFirst:false,
      isSim:false,
      sim:0,
    }
  }


  async componentDidMount() {
   
    if(isN(this.state.term)){
      let year=dayjs().format('YYYY')
      let month=dayjs().format('MM')
      
      if(month>=3&&month<=8){
        var term=dayjs().subtract(1, 'year').format('YYYY')+"-"+dayjs().format('YYYY')+"-2";
      }else if(month>=9){
        var term=dayjs().format('YYYY')+"-"+dayjs().add(1, 'year').format('YYYY')+"-1";
      }else{
        var term=dayjs().subtract(1, 'year').format('YYYY')+"-"+dayjs().format('YYYY')+"-1";;
      }
     
      if(term.substr(term.length-1) == 2){
        var oldterm = term.substr(0,term.length-1)+"1";
      }else{
        var oldterm = term.substr(0,4)-1+"-"+term.substr(0,4)+"-2";
      }

      this.setState({term:term, oldterm:oldterm})
    }

    let u=this.store.loadUser();
    if (isN(this.store.currUser)) {
      this.props.history.push("/login")
    }else{
      if(u.role == 1){
        this.props.history.push('/admin');
        return;
      }
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_QRY_CLS, null)
      this.setState({ loading: false, clsList:r.data})
      this.doSelCls(r.data[0].code)

    }
  } 


  doSelCls =async(e)=>{
    let params = { code: e,term: this.state.term}

    this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_QRY_CLS_MAIN, params)
    let {batchE} = this.state
    batchE.addr = r.data[0]?.addr
   
    r.data.map((item,i)=>{
      item.web = (item.web===1)?true:false
    })

    this.setState({ loading: false, clsDetail:r.data, code:e, batchE:batchE, tecList:r.tecList, expList:r.expList, isSim:false,isFirst:false })
    this.props.form.setFieldsValue({
      "desc": this.state.clsDetail[0].desc,
      "mate":this.state.clsDetail[0].mate,
      "exam":this.state.clsDetail[0].exam,
      "method":this.state.clsDetail[0].method,
      "q_time":this.state.clsDetail[0].q_time,
      "m_tech":this.state.clsDetail[0].m_tech,
      "s_tech":this.state.clsDetail[0].s_tech,
      "t_hour":this.state.clsDetail[0].t_hour,
      "e_hour":this.state.clsDetail[0].e_hour,
    })
    // this.props.form.setFieldsValue({this.state.clsDetail[0]})
  }

  doSelWeb=(e)=>{
    let {clsDetail} = this.state
    clsDetail[0].web = (!clsDetail[0].web)?1:0
    this.setState({clsDetail:clsDetail})
  }

  selMenu =(e)=>{
    
    this.setState({selMenu:e})
  }

  doSave=()=>{
    this.props.form.validateFields(async (err, values) => {
      if (err) { return }
      
      values.web = (values.web)?1:0
      let {tecList,code,expList,term } = this.state
   
      let params = { code:code,tecList:tecList,expList:expList, term:term ,...values }
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_SAV_CLS, params)
      this.setState({ loading: false, clsDetail:r.data, techList:r.techList, expList:r.expList})
    
      message.info("保存数据成功！")
    })
  }


  doChgVal=(k,e)=>{
    let val = e.currentTarget.value
    let {clsDetail} = this.state
    clsDetail[0][k] = val
    this.setState(clsDetail)
  }


  doChgFieldT=(k,e)=>{
    let val = e.currentTarget.value
    let {batchT} = this.state
    batchT[k] = val 
    this.setState({batchT:batchT})
  }

  doChgFieldE=(k,e)=>{
    let val = e.currentTarget.value
    let {batchE} = this.state
    batchE[k] = val 
    this.setState({batchE:batchE})
  }

  doShowDlgT=()=>{
    this.setState({showDlgT:true})
  }
  doShowDlgE=()=>{
    this.setState({showDlgE:true})
  }
  doCloseDlgT=()=>{
    this.setState({showDlgT:false})
  }
  doCloseDlgE=()=>{
    this.setState({showDlgE:false})
  }


  doBatchT=()=>{
    let {tecList,week} = this.state
    let {method,task,cnt,hour} = this.state.batchT
    tecList=[]
    for(let i=0;i<week;i++) {
      tecList.push({hour:hour||'',cnt:cnt||'', method:method||'', task:task||''})
    }
    this.setState({tecList:tecList,showDlgT:false,week:16})
  }

  doBatchE=()=>{
    let {expList,week} = this.state
    let {name,type,prop,addr,gnum,hour} = this.state.batchE
    expList=[]
    for(let i=0;i<week;i++) {
      expList.push({hour:hour||'',name:name||'', type:type, prop:prop, addr:addr,gnum:gnum })
    }
    this.setState({expList:expList,showDlgE:false,week:16})
  }


  doDelTechItem=(i)=>{
    let {tecList} = this.state
    tecList.splice(i,1)
    this.setState({tecList:tecList})
  }

  doDelExpItem=(i)=>{
    let {expList} = this.state
    expList.splice(i,1)
    this.setState({expList:expList})
  }


  doChgTecList=(i,k,e)=>{
    let val = e.currentTarget.value
    let {tecList} = this.state
    tecList[i][k]=val
    this.setState({tecList:tecList})
  }

  doChgExpList=(i,k,e)=>{
    let val = e.currentTarget.value
    let {expList} = this.state
    expList[i][k]=val
    this.setState({expList:expList})
  }


  doChgExpSel=(i,k,e)=>{
    let {batchE,expList} = this.state
    expList[i][k]=e
    this.setState({expList:expList})
  }

  doChgWeek=(e)=>{
    this.setState({week:e})
  }
  doChgHourT=(e)=>{
    let {batchT} = this.state
    batchT.hour = e 
    this.setState({batchT:batchT})
  }

  doChgHourE=(e)=>{
    let {batchE} = this.state
    batchE.hour = e 
    this.setState({batchE:batchE})
  }

  doChgNumE=(e)=>{
    let {batchE} = this.state
    batchE.gnum = e 
    this.setState({batchE:batchE})
  }

  
  doChgSel=(k,e)=>{
    let {batchE} = this.state
    switch(k) {
      case 'prop': batchE.prop = e;break;
      case 'type': batchE.type = e;break;
    }
    this.setState({batchE:batchE})
  }

 
  doImportT=async()=>{
    let that = this
    confirm({
      title: '提示',
      content: '您确认要将剪贴板的数据导入到教学进度？（原教学进度数据会被全部替换）',
      async onOk() {
        const t = await navigator.clipboard.readText();
        const ret = []
        const list = t.split('\r\n')
        list.map((item,i)=>{
          if (i!==list.length-1) {
            let r = item.split('\t')
            if (!Number.isInteger(parseInt(r[0]))) {
              message.error("第" + (i + 1) + "行课时需要为整数！");
              return;
            }
            ret.push({hour:r[0], cnt:r[1], method:r[2], task:r[3] })
          }
        })
        if (ret.length>16) {
          message.error('剪贴数据不能操过16周！')
        }else if (ret.length===0) {
          message.error('剪贴数据错误！')
        } else {
          that.setState({tecList:ret})
        }
      }
    });
  }

  doImportE=async()=>{
    let that = this
    confirm({
      title: '提示',
      content: '您确认要将剪贴板的数据导入到实验进度？（原实验进度数据会被全部替换）',
      async onOk() {
        const t = await navigator.clipboard.readText();

        const ret = []
        const list = t.split('\r\n')
        list.map((item,i)=>{
          if (i!==list.length-1) {
            let r = item.split('\t')
            if (!Number.isInteger(parseInt(r[0]))) {
              message.error("第" + (i + 1) + "行课时需要为整数！");
              return;
            }
            ret.push({hour:r[0], name:r[1], type:r[2], prop:r[3], addr:r[4], gnum:r[5] })
          }
        })
        if (ret.length>16) {
          message.error('剪贴数据不能操过16周！')
        }else if (ret.length===0) {
          message.error('剪贴数据错误！')
        } else {
          that.setState({expList:ret})
        }
      }
    });
  }


  printPDF = () => {
    this.setState( {showprint: true})
  };

  loadHisCls = async() =>{
    let {code,term,oldterm,isFirst}=this.state
    let params = { code: code,term:term, oldterm:oldterm}

   
      this.setState({ loading: true })
      let r = await this.props.mainStore.post(urls.API_IST_CLS_HIS, params)
      let {batchE} = this.state
      batchE.addr = r.data[0]?.addr
      r.data.map((item,i)=>{
        item.web = (item.web===1)?true:false
      })
      
      this.setState({ loading: false, clsDetail:r.data, code:code, batchE:batchE, tecList:r.tecList, expList:r.expList})
      this.props.form.setFieldsValue({
        "desc": this.state.clsDetail[0].desc,
        "mate":this.state.clsDetail[0].mate,
        "exam":this.state.clsDetail[0].exam,
        "method":this.state.clsDetail[0].method,
      })
      message.info("导入历史课程成功！")
    
  } 

  loadSimCls = async() =>{
    let {code,term,oldterm,isSim}=this.state
    let params = { code: code,term:term, oldterm:oldterm}
      
    this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_IST_CLS_SIM, params)
      
    let {batchE} = this.state
    
    batchE.addr = r.data[0]?.addr
    r.data.map((item,i)=>{
      item.web = (item.web===1)?true:false
    })
    this.setState({ loading: false, clsDetail:r.data, code:code, batchE:batchE, tecList:r.tecList, expList:r.expList,isSim:false,isFirst:false})
    this.props.form.setFieldsValue({
      "desc": this.state.clsDetail[0].desc,
      "mate":this.state.clsDetail[0].mate,
      "exam":this.state.clsDetail[0].exam,
      "method":this.state.clsDetail[0].method,
    })
    message.info("导入同类课程成功！")
      
  }

  importPhoto=async (e) => {
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      const width=150;
      const height=50;
      const blob = await fileToBlob(file, width, height, 0.7);
      let formData = new FormData();
      let filetype = 'user';
      formData.append('uid', "teacherUid");
      formData.append('file', blob);
      
      let r = await this.store.post(urls.API_UPLOAD, formData, filetype);
      if (r.code === 200) {
        message.info('上传图片成功');
      } else {
        message.error(r.msg);
      }
    }
  }

  
  render() {
   
    let {clsList,clsDetail,funList,partList,selMenu,tecList,expList,term,oldterm,isFirst,isSim} = this.state
    let cls = clsDetail[0]
    if (!isN(cls)) {
      cls.w_hour = parseInt(cls?.t_hour) + parseInt(cls?.e_hour)
      cls.a_hour = cls.w_hour*16
    }
   
    const {getFieldDecorator} = this.props.form


    return (

      <Spin spinning={this.state.loading}>
        
        <div className="g-sysa">
          
          <div className="m-bd">
            <div className="m-tab_list">

              <div className="m-fun">
                <div className="m-tl">
                  {term}课程
                </div>
                {clsList?.map((item,i)=>
                  <div className="m-cls" key={i} onClick={this.doSelCls.bind(this,item.code)}>{item.name}</div>
                )}
              </div>


              {clsDetail.length != 0&&
              <>
                
                <div className="m-fun">
                  <Tooltip placement="right" title="保存数据">
                    <div className="m-item" style={{'background':'#348f03','color':'#fff'}} onClick={this.doSave}>保存数据</div>
                  </Tooltip>
                </div>  
                <div className="m-fun">
                <Tooltip placement="right" title="导入历史课程">
                  <div
                    className="m-item"
                    style={{
                      background: cls?.his === 1 ? '#f78547' : '#666',
                      color: '#fff',
                      cursor: cls?.his === 1 ? 'pointer' : 'default',
                    }}
                    onClick={cls?.his === 1 ? this.loadHisCls : undefined}
                  >
                    导入历史课程
                  </div>
                </Tooltip>

                  <Tooltip placement="right" title="导入同类课程">
                    <div
                      className="m-item"
                      style={{
                        background: cls?.sim == 1 ? '#f78547' : '#666',
                        color: '#fff',
                        cursor: cls?.sim == 1 ? 'pointer' : 'default',
                      }}
                      onClick={cls?.sim == 1 ? this.loadSimCls : undefined}
                    >
                      导入同类课程
                    </div>
                  </Tooltip>
                </div>

                {!isFirst &&
                <>
                <div className="m-fun">
                  <Tooltip placement="right"title="Excel选择16行4列拷贝">
                    <div className="m-item" style={{'background':'#41ba00','color':'#fff'}} onClick={this.doImportT}>剪贴导入教学</div>
                  </Tooltip>
                  <Tooltip placement="right"title="Excel选择16行6列拷贝">
                    <div className="m-item" style={{'background':'#41ba00','color':'#fff'}} onClick={this.doImportE}>剪贴导入实验</div>
                  </Tooltip>
                  
                  
                </div>
                <div className="m-fun">
                  <Tooltip placement="right" title="批量生成若干周教学数据">
                    <div className="m-item" style={{'background':'#b8d800','color':'#fff'}} onClick={this.doShowDlgT}>批量教学进度</div>
                  </Tooltip>
                  <Tooltip placement="right" title="批量生成若干周实验数据">
                    <div className="m-item" style={{'background':'#b8d800','color':'#fff'}} onClick={this.doShowDlgE}>批量实验进度</div>
                  </Tooltip>
                </div>

                <div className="m-fun">
                  <Tooltip placement="right" title="点击生成PDF文件">
                    <div className="m-item" style={{'background':'#b8d8f0','color':'#fff'}} onClick={this.printPDF.bind(this,clsDetail[0].bname,clsDetail[0].uid)}>生成PDF文件</div>
                  </Tooltip>
                </div>
               <div className="m-fun">
                {/* <Tooltip placement="right" title="点击上传电子签名">
        

                  <div className="m-item" style={{'background':'#b8d8f0','color':'#fff'}} onClick={this.printPDF.bind(this,clsDetail[0].bname,clsDetail[0].uid)}>
                    
                   <input className="m-item" style={{'width':'0px','height':'0px','background':'#b8d8f0','color':'#fff'}} type="file" accept="image/*;" capture="user" onChange={this.importPhoto.bind(this)} />
                    
                    点击上传电子签名</div>
                </Tooltip> */}

                  {/* <label htmlFor="file-upload" className="m-item" style={{'background':'#b8d8f0','color':'#fff'}}>
                      <i className="fa fa-cloud-upload"></i> 点击上传电子签名
                  </label>
                  <input id="file-upload" type="file"  accept="image/*;" capture="user" onChange={this.importPhoto.bind(this)}/> */}

                </div>
                </>
                }

              </>}
            </div>

            {(clsDetail.length!==0)&&
            <div className="m-tab_cnt">
              <Form  ref={this.formRef} className="m-form" layout="horizontal" >
                <div className="m-hd">
                  <div className="m-term">{term}学年</div>
                  <div className="m-title">
                    <span>{cls?.name}</span>
                    <span>{cls?.ename}</span>
                  </div>
                  <div className="m-info">
                    <span>{cls?.cform}</span>
                    <span>{cls?.cprop}</span>
                  </div>

                  <div className="m-menu">
                    {menuList.map((item,i)=>
                      <div key={i} className={(item.val==1)?"m-item sel":"m-item"} onClick={this.selMenu.bind(this,i)}>{item}</div>
                    )}
                  </div>
                </div>

                

                <>
                  <div className={((selMenu==0)||(selMenu==1))?"m-main":"m-main fn-hide"} >
                    <div className="m-tl">基本信息</div>

                    <div className="m-sect">
                      <div className="m-item">
                        <label>授课校区</label>
                           <Form.Item>
                          {getFieldDecorator('pos', { 
                            rules: [{required: true, message: ' 请输入授课校区!'}], 
                            initialValue: cls?.pos
                          })(<Input onChange={this.doChgVal.bind(this,'pos')} />)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>开课学院</label>
                        <span>{cls?.col}</span>
                      </div>
                      <div className="m-item">
                        <label>课程学分</label>
                        <span>{cls?.mark}</span>
                      </div>
                      <div className="m-item">
                        <label>教学周期</label>
                        <span>{cls?.week}</span>
                      </div>
                    </div>
                    <div className="m-sect">
                      <div className="m-item">
                        <label>理论课时</label>
                        <Form.Item>
                          {getFieldDecorator('t_hour', { 
                            rules: [{required: true, message: ' 请输入理论课时!'}], 
                            initialValue: cls?.t_hour 
                          })(<Input onChange={this.doChgVal.bind(this,'t_hour')} />)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>实验课时</label>
                        <Form.Item>
                          {getFieldDecorator('e_hour', { 
                            rules: [{required: true, message: ' 请输入实验课时!'}], 
                            initialValue: cls?.e_hour 
                          })(<Input onChange={this.doChgVal.bind(this,'e_hour')} />)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>周学时数</label>
                        <span>{cls?.w_hour}</span>
                      </div>
                      <div className="m-item">
                        <label>总课时数</label>
                        <span>{cls?.a_hour}</span>
                      </div>
                    </div>

                    <div className="m-sect">
                      <div className="m-item">
                        <label>主讲教师</label>
                        <Form.Item>
                          {getFieldDecorator('m_tech', { 
                            rules: [{required: true, message: ' 请输入主讲教师!'}], 
                            initialValue: cls?.m_tech 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>辅导教师</label>
                        <Form.Item>
                          {getFieldDecorator('s_tech', { 
                            rules: [{required: false, message: ' 请输入辅导教师!'}], 
                            initialValue: cls?.s_tech 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>答疑时间</label>
                        <Form.Item>
                          {getFieldDecorator('q_time', { 
                            rules: [{required: false, message: ' 请输入答疑时间!'}], 
                            initialValue: cls?.q_time 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>答疑地点</label>
                        <Form.Item>
                          {getFieldDecorator('q_addr', { 
                            rules: [{required: false, message: ' 请输入答疑地点!'}], 
                            initialValue: cls?.q_addr 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                    </div>

                    {(cls?.web)&&
                    <div className="m-sect">
                      <div className="m-item">
                        <label>教学网站</label>
                        <Form.Item>
                          {getFieldDecorator('url', { 
                            rules: [{required: true, message: ' 请输入教学网站地址!'}], 
                            initialValue: cls?.url 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>点击次数</label>
                        <Form.Item>
                          {getFieldDecorator('click', { 
                            rules: [{required: true, message: ' 请输入点击次数!'}], 
                            initialValue: cls?.click 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>账号名称</label>
                        <Form.Item>
                          {getFieldDecorator('usr', { 
                            rules: [{required: true, message: ' 请输入账号!'}], 
                            initialValue: cls?.usr 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                      <div className="m-item">
                        <label>登录密码</label>
                        <Form.Item>
                          {getFieldDecorator('pwd', { 
                            rules: [{required: true, message: ' 请输入登录密码!'}], 
                            initialValue: cls?.pwd 
                          })(<Input/>)}
                        </Form.Item>
                      </div>
                    </div>}
                  </div>

                  <div className={((selMenu==0)||(selMenu==1))?"m-main":"m-main fn-hide"}>
                    <div className="m-tab">
                      {clsDetail.map((item,i)=>
                        <div className="m-row" key={i}>
                          <span>{i+1}</span>
                          <span>{item.name}</span>
                          <span>
                           <Form.Item>
                          {getFieldDecorator(`cls${i}`, { 
                            rules: [{required: true, message: ' 请输入班级!'}], 
                            initialValue: item?.cls
                          })(<Input/>)}
                          </Form.Item> 
                          </span>
                          <span>
                          <Form.Item>
                          {getFieldDecorator(`st_num${i}`, { 
                            rules: [{required: true, message: ' 请输入教学人数!'}], 
                            initialValue: item?.st_num 
                          })(<Input/>)}
                          </Form.Item>
                          </span>
                          <span><Form.Item>
                          {getFieldDecorator(`wt${i}`, { 
                            rules: [{required: true, message: ' 请输入教学时间!'}], 
                            initialValue: item?.wt 
                          })(<Input/>)}
                          </Form.Item></span>
                          <span><Form.Item>
                          {getFieldDecorator(`addr${i}`, { 
                            rules: [{required: true, message: ' 请输入教学地点!'}], 
                            initialValue: item?.addr 
                          })(<Input/>)}
                          </Form.Item></span>
                        </div>
                      )}
                    </div>
                  </div>
                        
                  <div className={((selMenu==0)||(selMenu==1))?"m-main":"m-main fn-hide"}>
                    <div className="m-tab">
                      <label>课程描述及与其他课程关系<em>(不超过200字)</em></label>
                      <Form.Item>
                        {getFieldDecorator('desc', { 
                          initialValue: cls?.desc 
                        })(<TextArea maxLength={200} autoSize={true}/>)}
                      </Form.Item>
                      <label>使用教材与参考书目<em>(不超过200字)</em></label>
                      {getFieldDecorator('mate', { 
                        initialValue: cls?.mate 
                      })(<TextArea maxLength={200} autoSize={true}/>)}
                      <label>课程考核<em>(不超过200字)</em></label>
                      {getFieldDecorator('exam', { 
                        initialValue: cls?.exam 
                      })(<TextArea maxLength={200} autoSize={true}/>)}
                      <label>教学方法与手段及相关要求<em>(不超过200字)</em></label>
                      {getFieldDecorator('method', { 
                        initialValue: cls?.method 
                      })(<TextArea maxLength={200} autoSize={true}/>)}
                    </div>
                  </div>
                </>

                
                <div className={((selMenu==0)||(selMenu==2))?"m-main":"m-main fn-hide"} style={{'margin':'35px 0 0 0'}}>
                  <div className="m-tl">教学进度</div>
                  <div className="m-tech">
                    <div className="m-row-t">
                      <span className="fn-hide"></span>
                      <span>课时数</span>
                      <span>主要教学内容</span>
                      <span>教学形式及内容资料</span>
                      <span>作业与辅导安排</span>
                      
                    </div>

                    {(tecList.length==0)&&<div className="m-none">暂无数据</div>}

                    {tecList.map((item,i)=>
                      <div className="m-row-t" key={i}>
                        <span onClick={this.doDelTechItem.bind(this,i)}>{i+1}</span>
                        <Input onChange={this.doChgTecList.bind(this,i,'hour')} value={item.hour} />
                        <Input onChange={this.doChgTecList.bind(this,i,'cnt')} value={item.cnt} />
                        <Input onChange={this.doChgTecList.bind(this,i,'method')} value={item.method} />
                        <Input onChange={this.doChgTecList.bind(this,i,'task')} value={item.task} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={((selMenu==0)||(selMenu==3))?"m-main":"m-main fn-hide"}  style={{'margin':'35px 0 0 0'}}>
                  <div className="m-tl">实验进度</div>
                  <div className="m-tech">
                    <div className="m-row-e">
                      <span className="fn-hide"></span>
                      <span>课时数</span>
                      <span>实验项目名称</span>
                      <span>实验性质</span>
                      <span>实验要求</span>
                      <span>实验教室</span>
                      <span>每组人数</span>
                    </div>
                    {(expList.length==0)&&<div className="m-none">暂无数据</div>}

                    {expList.map((item,i)=>
                      <div className="m-row-e" key={i}>
                        <span onClick={this.doDelExpItem.bind(this,i)}>{i+1}</span>
                        <Input onChange={this.doChgExpList.bind(this,i,'hour')} value={item.hour} />
                        <Input onChange={this.doChgExpList.bind(this,i,'name')} value={item.name} />
                        <Select value={item.type} onChange={this.doChgExpSel.bind(this,i,'type')} style={{'width':'80px','margin':'0 5px'}} size='small' > 
                          <Option value="验证">验证</Option>
                          <Option value="设计">设计</Option>
                          <Option value="研究">研究</Option>
                          <Option value="综合">综合</Option>
                          <Option value="演示">演示</Option>
                        </Select>
                        <Select value={item.prop} onChange={this.doChgExpSel.bind(this,i,'prop')} style={{'width':'80px','margin':'0 5px'}} size='small'> 
                          <Option value="验证">必做</Option>
                          <Option value="设计">选做</Option>
                        </Select>
                        <Input onChange={this.doChgExpList.bind(this,i,'addr')} value={item.addr} />
                        <Input onChange={this.doChgExpList.bind(this,i,'gnum')} value={item.gnum} />
                      </div>
                    )}
                  </div>
                </div>
                
              </Form>
            </div>}

            {(clsDetail.length==0)&&<div className="m-tab_none"></div>}
            
          </div>
        </div>

        <Drawer title="批量教学进度" width="300" onClose={this.doCloseDlgT} visible={this.state.showDlgT}>
          <div className="g-field">
            <label>教学周</label>
            <InputNumber min={1} max={16} defaultValue={16} style={{'width':'100%'}} onChange={this.doChgWeek}/>
          </div>
          <div className="g-field">
            <label>课时数</label>
            <InputNumber min={1} max={16}  style={{'width':'100%'}} onChange={this.doChgHourT}/>
          </div>
          <div className="g-field">
            <label>主要教学内容</label>
            <TextArea rows={4} onChange={this.doChgFieldT.bind(this,'cnt')} defaultValue=''/>
          </div>
          <div className="g-field">
            <label>教学形式及内容资料</label>
            <TextArea rows={4} onChange={this.doChgFieldT.bind(this,'method')} defaultValue=''/>
          </div>
          <div className="g-field">
            <label>作业与辅导安排</label>
            <TextArea rows={4} onChange={this.doChgFieldT.bind(this,'task')} defaultValue=''/>
          </div>
          <div className="g-fun">
            <Button onClick={this.doCloseDlgT}>取消</Button>
            <Button type="primary" onClick={this.doBatchT}>生成数据</Button>
          </div>
        </Drawer>

        <Drawer title="批量实验进度" width="300" onClose={this.doCloseDlgE} visible={this.state.showDlgE}>
          <div className="g-field">
            <label>教学周</label>
            <InputNumber min={1} max={16} defaultValue={16} style={{'width':'100%'}} onChange={this.doChgWeek}/>
          </div>
          <div className="g-field">
            <label>课时数</label>
            <InputNumber min={1} max={10} onChange={this.doChgHourE} style={{'width':'100%'}}/>
          </div>
          <div className="g-field">
            <label>实验项目名称</label>
            <TextArea rows={1} onChange={this.doChgFieldE.bind(this,'name')}/>
          </div>
          <div className="g-field">
            <label>实验性质</label>
            <Select defaultValue="验证" onChange={this.doChgSel.bind(this,'type')} > 
              <Option value="验证">验证</Option>
              <Option value="设计">设计</Option>
              <Option value="研究">研究</Option>
              <Option value="综合">综合</Option>
              <Option value="演示">演示</Option>
            </Select>
          </div>
          <div className="g-field">
            <label>实验要求</label>
            <Select defaultValue="必做" onChange={this.doChgSel.bind(this,'prop')} > 
              <Option value="验证">必做</Option>
              <Option value="设计">选做</Option>
            </Select>
          </div>
          <div className="g-field">
            <label>实验教室</label>
            <Input onChange={this.doChgFieldE.bind(this,'addr')} defaultValue={cls?.addr}/>
          </div>
          <div className="g-field">
            <label>每组人数</label>
            <InputNumber min={1} max={10} defaultValue={1} onChange={this.doChgNumE} style={{'width':'100%'}}/>
          </div>
          <div className="g-fun">
            <Button onClick={this.doCloseDlgE}>取消</Button>
            <Button type="primary" onClick={this.doBatchE}>生成数据</Button>
          </div>
        </Drawer>
      
      {(this.state.showprint)&&<Print cls={cls} clsDetail={clsDetail} course={clsList[0]} tecList={tecList} expList={expList}/>}
      </Spin>
    );
  }
}

export default Form.create()(Tech)

