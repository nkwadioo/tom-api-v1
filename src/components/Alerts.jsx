import React from 'react'

export default function Alerts({Alert}) {
  return (
      <>
        {Alert.show && Alert.type === 'success' &&
            <div className="bg-green-400 opacity-100 z-10 rounded-lg border-gray-300 border p-3 shadow-lg w-5/6 lg:w-3/6 ml-auto fixed top-2 right-1">
              <div className="flex flex-row">
                <div className="px-2">
                </div>
                <div className="ml-2 mr-6">
                  <span className="font-semibold">Success!</span>
                  <span className="block text-white">{Alert.message}</span>
                </div>
              </div>
            </div>
        }
  
        {Alert.show && Alert.type === 'error' &&
            <div className="bg-red-400 opacity-100 z-10 rounded-lg border-gray-300 border p-3 shadow-lg w-5/6 lg:w-3/6 ml-auto fixed top-2 right-1">
                <div className="flex flex-row">
                    <div className="px-2">
                    </div>
                    <div className="ml-2 mr-6">
                    <span className="font-semibold">Error!</span>
                    <span className="block text-white">{Alert.message}</span>
                    </div>
                </div>
            </div>
        }
      </>
  )
}

