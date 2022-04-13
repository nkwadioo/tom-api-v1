import React from 'react';


export default function Nav() {
    return (
        <nav className='shadow'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink flex content-center">
                            <img
                            className="h-8 w-8"
                            src="/images/api.png"
                            alt="Workflow"
                            />
                            <span className='self-end'>TOM API Demo</span>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {/* Profile dropdown */}
                            <span className="sr-only">Open user menu</span>
                            <img className="h-8 w-8 rounded-full" src="/images/profile.jpg" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}