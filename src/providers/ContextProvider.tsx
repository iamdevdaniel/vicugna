import React from 'react'

interface IAppContext {
    viewNames: {
        shearingEventList: string
        form10Header: string
        form10Entry: string
    }
}

const context = {
    viewNames: {
        shearingEventList: 'ShearingEventList',
        form10Header: 'Form10Header',
        form10Entry: 'Form10Entry',
    },
}

export const AppContext = React.createContext<IAppContext>(context)

type ContextProviderProps = {
    children: React.ReactNode
}

const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => (
    <AppContext.Provider value={context}>{children}</AppContext.Provider>
)

export default ContextProvider
