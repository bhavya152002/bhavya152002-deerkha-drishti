"use client";
import React from 'react';
import VideoPlayer from './VideoPlayer';

const STREAMS = [
    "rtsp://admin:Password!1@192.168.29.2:554/cam/realmonitor?channel=1&subtype=0",
    "rtsp://admin:Password!1@192.168.29.3:554/cam/realmonitor?channel=1&subtype=0",
    "rtsp://admin:Password!1@192.168.29.33",
    "rtsp://admin:Password!1@192.168.29.98",
    "rtsp://admin:Password!1@192.168.29.74",
    "rtsp://admin:Password!1@192.168.29.40",
    "rtsp://admin:Password!1@192.168.29.72",
    "rtsp://admin:Password!1@192.168.29.80",
    "rtsp://admin:Password!1@192.168.29.221",
];

const StreamGrid = () => {
    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-100">CCTV Monitoring Station</h1>
                <div className="text-sm text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2 animate-pulse"></span>
                    Live Systems Online
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STREAMS.map((url, index) => (
                    <VideoPlayer key={index} url={url} title={`Camera ${index + 1}`} index={index} />
                ))}
            </div>
        </div>
    );
};

export default StreamGrid;
