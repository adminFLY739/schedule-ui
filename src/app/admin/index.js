import React from 'react'
import { Icon, Form, notification, Input, Button, Spin, message } from 'antd'
import { inject, observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import token from '../../util/token.js'
import * as urls from '../../constant/urls'
import {isN,msg} from '../../util/fn'
import {saveUser} from '../../util/token'
import { API_SERVER } from '../../constant/apis'

import './index.less'
import logo from "../../img/logo_w.svg"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

@inject('mainStore')
@observer
class Admin extends React.Component {
	constructor(props) {
		super(props)
		this.store = this.props.mainStore
		this.state = {
			loading: false,
		}
	}

	async componentDidMount(){
		let u=this.store.loadUser();

		if(u == undefined){
			this.props.history.push('/')
			return;
		}			
			
		if(u.role!=1 ){this.props.history.push('/');return null;}
	}

  generateDocx=async()=>{

	this.setState({ loading: true })
    let r = await this.props.mainStore.post(urls.API_GEN_DOCX, null)
	this.setState({ loading: false })
	r.path = r.path.substring(r.path.lastIndexOf('/')+1);
	await delay(5000)

	window.open(`${API_SERVER}/${r.path}`)
	message.info("生成ZIP成功！")
  }
	render() {
		return (
			<Spin spinning={this.state.loading} tip="Loading">
				<div className='g-login' onKeyUp={this.onKeyUp}>
					<div className='m-form'>
							<Button type="primary" className="input-btn" onClick={this.generateDocx} >生成ZIP文件</Button>
					</div>
				</div>
			</Spin>
		)
	}
}

export default Admin