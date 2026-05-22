# SyncingSteel HRIS - Network Deployment Guide

This guide explains how to make the SyncingSteel HRIS application accessible to all computers on your local office network using the custom local domain name: **`cameco.test`**.

## The Goal
By default, custom domain names like `cameco.test` are not recognized by public internet DNS servers. To allow all office computers (PCs, Macs, and mobile devices) to access the HRIS system using this easy-to-remember name, we need to instruct your office's central WiFi Router to route traffic for `cameco.test` to the Ubuntu Server that hosts the application.

### Server Details
- **Application URL:** `http://cameco.test`
- **Ubuntu Server IP Address:** `192.168.1.102`
- **Web Server:** Caddy (Running on Port 80)

---

## Step-by-Step Router Configuration (Network-Wide DNS)

This approach is highly recommended for office environments because you only need to configure this **once** on the central router. Afterward, any device connected to the office network will instantly be able to access the HRIS system without individual configuration.

### 1. Log into your Office WiFi Router
1. Find the IP address of your office router (commonly `192.168.1.1`, `192.168.0.1`, or `10.0.0.1`).
2. Open a web browser on any computer connected to the network and enter the router's IP address.
3. Log in using the administrator credentials for the router.

### 2. Locate the Local DNS Settings
Depending on your router brand (TP-Link, Asus, Mikrotik, Unifi, etc.), look for a setting named one of the following:
- **Local DNS Record**
- **Static DNS**
- **Host Mapping**
- **LAN DNS**
- **DNS Forwarding**

*(Usually found under Advanced Settings, LAN Settings, or Network Configuration).*

### 3. Add the DNS Record
Create a new DNS record with the following details:
- **Domain Name / Hostname:** `cameco.test`
- **IP Address / Target:** `192.168.1.102`

### 4. Save and Apply
Save your changes. You may need to reboot the router for the changes to broadcast to all connected devices.

---

## Verifying the Setup

1. Take any computer or phone connected to the office WiFi network.
2. Open a web browser (Chrome, Edge, Safari).
3. Type `http://cameco.test` in the address bar and press Enter.

If the router was configured correctly, the SyncingSteel HRIS login page will load immediately!

---

## Troubleshooting

- **Page Not Found / DNS Error:** If a specific computer still cannot reach the page, it may be caching old DNS results. Open Command Prompt on that Windows PC and run `ipconfig /flushdns`, or simply restart the computer.
- **Server IP Changed:** Ensure your Ubuntu Server (`192.168.1.102`) has a **Static IP** assigned to it in the router's DHCP settings so that the IP address does not change when the server restarts.
