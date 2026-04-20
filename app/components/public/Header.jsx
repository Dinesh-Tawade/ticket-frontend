import React from 'react'

function Header() {
  return (
    <header className='bg-gray-800 text-white shadow-lg'>
      <div className='container mx-auto p-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold'>My App</h1>
        <nav>
          <ul className='flex space-x-6'>
            <li className='hover:text-gray-300 cursor-pointer'>Home</li>
            <li className='hover:text-gray-300 cursor-pointer'>About</li>
            <li className='hover:text-gray-300 cursor-pointer'>Contact</li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header