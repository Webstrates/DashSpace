import React from 'react';
import { Varv, useProperty, useAction } from '#VarvReact';



function UserRenamer() {
    let [name, setName] = useProperty('name');
    return <label>
        Rename User
        <input value={name ? name : ''} onChange={e => setName(e.target.value)} title='Rename User' />
    </label>;
}

function UserSelector() {
    let [name] = useProperty('name');
    let [local] = useProperty('local');
    let select = useAction('selectUser');
    return <div className='user' local={local ? 'true' : null} onClick={select} title={'Select User ' + name}>{name}</div>
}

export function Login() {
    return <div className="user-manager-modal" >
        <div className="user-manager">
            <div className="user-headline">User Selection</div>
            <div className="user-menu">
                <button view="addUserButton" title="Add User">Add User</button>
                <button view="deleteUserButton" className="red" title="Delete User">Delete User</button>
                <Varv property="localUser">
                    <UserRenamer />
                </Varv>
            </div>
            <div className="user-list">
                <Varv concept="User">
                    <UserSelector />
                </Varv>
            </div>
            <button view="loginButton" className="login-button green" title="Enter">Enter DashSpace</button>
        </div>
    </div>;
}
