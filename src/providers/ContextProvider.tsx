import React from 'react'

interface IAppContext {}

const context = {}

export const AppContext = React.createContext<IAppContext>(context)

type ContextProviderProps = {
    children: React.ReactNode
}

const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => (
    <AppContext.Provider value={context}>{children}</AppContext.Provider>
)

export default ContextProvider
