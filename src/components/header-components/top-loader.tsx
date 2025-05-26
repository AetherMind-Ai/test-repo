'use client'
import MindBotZustand from '@/utils/mindbot-zustand'
import React from 'react'

const TopLoader = () => {
    const { topLoader } = MindBotZustand()
    return (
        <div className="absolute bottom-0 inset-x-0">
            {topLoader && <div className="loader"/>}
        </div>
    )
}

export default TopLoader