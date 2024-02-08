import React from 'react'
import { User } from 'vicugna-types'

interface IAppContext {
    user: User
}

const appContext: IAppContext = {
    user: {
        id: 'dev_dm',
        name: 'Daniel Maydana',
        role: 'admin',
    },
}

export const AppContext = React.createContext<IAppContext>(appContext)

type ContextProviderProps = {
    children: React.ReactNode
}

const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
)

export default ContextProvider
