import React from 'react'
import './user-info.scss'

const UserInfo = ({ user }) => {
    return (
        <div className='user-info'>
            <div className="user-info__img">
                <img src="https://namami-infotech.com/EvaraBackend/assets/sku/logo.png" alt="" />
            </div>
            <div className="user-info__name">
                <span>{user.name}</span>
            </div>
        </div>
    )
}

export default UserInfo
