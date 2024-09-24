var mode = process.env.REACT_APP_MY_VAR
// var API_SERVER = 'https://jsj.hznu.edu.cn:8080'
var API_SERVER = 'http://localhost:8080'
if (mode === 'development') {
   API_SERVER = 'http://localhost:8080'
  // API_SERVER = 'https://jsj.hznu.edu.cn:8080'
}

if (mode === 'production') {
     API_SERVER = 'http://localhost:8080'
    // API_SERVER = 'https://jsj.hznu.edu.cn:8080'
  
}

export { API_SERVER }
