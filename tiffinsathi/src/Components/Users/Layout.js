import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
        <Header />
        
        <main className='flex-1 w-full'>
            <Outlet />
        </main>

        <Footer />
    </div>
  )
}

export default Layout