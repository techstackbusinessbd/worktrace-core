const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Replace with your company's enrollment token
const ENROLLMENT_TOKEN = 'PHMBY9FOIU'; 

async function simulateAgent() {
    console.log('--- WorkTrace Silent Agent Simulator (10 Devices) ---');
    
    for (let i = 1; i <= 10; i++) {
        const macAddress = `00:1A:2B:3C:4D:${i.toString().padStart(2, '0')}`;
        const hostname = `Test-PC-${i.toString().padStart(2, '0')}`;
        
        console.log(`\n[Device ${i}] Enrolling: ${hostname} (${macAddress})...`);
        
        try {
            // 1. Enroll Device using Company Token
            const enrollRes = await axios.post(`${BASE_URL}/agent/enroll`, {
                enrollment_token: ENROLLMENT_TOKEN,
                mac_address: macAddress,
                hostname: hostname
            });
            
            const deviceToken = enrollRes.data.device_token;
            const deviceId = enrollRes.data.device_id;
            console.log(`✅ [Device ${i}] Enrolled! Device ID: ${deviceId}`);

            // Axios instance with Device Token
            const api = axios.create({
                baseURL: BASE_URL,
                headers: {
                    'Authorization': `Bearer ${deviceToken}`,
                    'Accept': 'application/json'
                }
            });

            // 2. Send Fake Activities
            console.log(`[Device ${i}] Sending fake activity telemetry...`);
            const now = new Date();
            const tenMinsAgo = new Date(now.getTime() - 10 * 60000);
            
            const activities = {
                activities: [
                    {
                        start_time: tenMinsAgo.toISOString(),
                        end_time: now.toISOString(),
                        application_name: "Google Chrome",
                        window_title: `Testing on ${hostname}`,
                        keyboard_strokes: Math.floor(Math.random() * 500) + 100,
                        mouse_clicks: Math.floor(Math.random() * 200) + 50,
                        is_idle: false
                    }
                ]
            };

            const activityRes = await api.post('/tracker/activity', activities);
            console.log(`✅ [Device ${i}] Activity Status: ${activityRes.status} OK`);

        } catch (error) {
            console.error(`❌ [Device ${i}] Error:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        }
    }
    
    console.log('\n✅✅ Simulation of 10 Devices Complete!');
}

simulateAgent();
