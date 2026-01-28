<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BlV6WmQdsCCcUwD6nXmcQSMWMRceDOIw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


### Prompt 
**Role:** Act as a Senior Full Stack Developer & UI/UX Designer specialized in Enterprise Dashboards.
**Task:** Create a **Single Page Application (SPA)** called **"FixIt Pro: ระบบแจ้งซ่อมครุภัณฑ์แบบครบวงจร"**.
**Tech Stack:**
* HTML5, CSS3, Vanilla JavaScript (Single `index.html`).
* **Libraries (CDN):**
    1.  `Chart.js` (For Dashboard Visualization).
    2.  `SweetAlert2` (For beautiful popup notifications).
    3.  `FontAwesome` (For Icons).
    4.  `Animate.css` (For smooth transitions).
**Language:** **THAI (ภาษาไทย)** for all UI.
**Database:** Use `localStorage`.

---

### **1. 🎨 Design System: "Royal Glassmorphism & Motion"**
* **Layout:**
    * **Desktop:** Fixed Left Sidebar (Rich Purple Gradient) + Scrollable Content Area.
    * **Mobile:** Collapsible Sidebar (Hamburger Menu) or Bottom Nav.
* **Color Palette:**
    * **Brand:** `#6200EA` to `#B388FF` (Deep Purple Gradient).
    * **Background:** `#F4F7FE` (Pale Blue-Grey).
    * **Glass Card:** White with `backdrop-filter: blur(10px)`, `border-radius: 20px`, and soft shadow.
* **Typography:** Google Font **'Sarabun'**.
* **Micro-interactions:** Buttons should have hover effects (scale/shadow). Content should fade in using Animate.css.

---

### **2. 💾 Data Structure**
Initialize `localStorage`:
* **Users:** Admin (Role: Staff), User (Role: Requester).
* **RepairTickets:** Array of objects including:
    * `id`, `requesterName`, `department`, `date`.
    * `assetType` (Computer, AC, etc.), `assetID`, `symptoms`.
    * `priority` (Normal, Urgent, Emergency).
    * `status` (Pending, In Progress, Vendor, Completed).
    * `staffLog` (Vendor Name, Repair Date, Cost).

---

### **3. 📱 User Interface (Views)**

#### **A. Navigation (Sidebar)**
* **Header:** Logo + App Name.
* **User Profile:** Avatar + Name + Role Badge.
* **Menu:** Dashboard (Admin), My Requests (User), Settings, Logout.
* **Footer:** *"Freeman @ Copyright Krukai ฝากแชร์ ฝากติดตาม"*.

#### **B. Dashboard (Content Area)**
* **Top Bar:** Real-time Clock (DD/MM/YYYY HH:MM:SS) + Notifications Bell.
* **Admin Dashboard:**
    * **Summary Cards:** 4 Colorful Cards (Total, Pending, Fixing, Done).
    * **Chart Section:** Use `Chart.js` to render a **Doughnut Chart** showing "Repair Stats by Asset Type" (e.g., Air Con 40%, PC 30%).
    * **Recent Table:** List of latest tickets with **Search Bar** and **Status Filter**.
* **User Dashboard:**
    * **Welcome Card:** "สวัสดี [Name]" + Button **[+ แจ้งซ่อมทันที]**.
    * **Status Tracking:** A timeline or list showing status of their own requests.

#### **C. The Forms (PDF Logic)**
* **Create Request Modal:**
    * Fields from PDF: Name, Dept, Tel.
    * Asset Info: Type (Radio), ID, Room.
    * **New Field:** **Priority Level** (Select: ปกติ, ด่วน, ฉุกเฉิน).
    * Symptoms: Textarea.
* **Manage Modal (Staff Only):**
    * Edit Status.
    * Input Vendor info / Cost.
    * Button **[🖨️ Print Form]**: Generates the exact PDF layout for printing (hides web UI).

---

### **4. ⚙️ Advanced Functionality**
1.  **Search & Filter:** Create a JavaScript function to filter the Admin table table in real-time as the user types in the Search Box.
2.  **SweetAlert2 Integration:**
    * Success: Show a green popup when saved.
    * Confirm: Show a "Are you sure?" popup before deleting.
3.  **Dynamic Chart:** The Chart.js instance must update automatically when a new ticket is added.
4.  **Priority Highlighting:** In the table, if Priority is "Urgent", highlight the row with a light red background.

**Deliverable:**
Generate the complete `index.html` file. Ensure code is organized, commented, and runs without errors.
