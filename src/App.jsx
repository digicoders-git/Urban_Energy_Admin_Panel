import React from 'react'
import AdminLogin from './Pages/Adminlogin'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import DashboardLayout from './Components/DashboardLayout'
const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<AdminLogin/>}/>
        <Route path='/dashboard' element={<DashboardLayout/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App