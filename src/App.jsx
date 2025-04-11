import React from 'react'
import Rant from './pages/Rant'
import { SnackbarProvider } from 'notistack';
import './App.css'

function App() {

    return (
        <SnackbarProvider>
            <>
                <Rant />
            </>
        </SnackbarProvider>
    )
}

export default App
