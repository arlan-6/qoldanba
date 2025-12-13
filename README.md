# Qoldanba 🎓

**Qoldanba** is your intelligent academic autopilot. It centralizes your university life by automatically syncing deadlines from your LMS and displaying your class schedule in one beautiful, distraction-free dashboard.

![Qoldanba Dashboard Preview](https://placehold.co/1200x600/png?text=Qoldanba+Dashboard)

## ✨ Features

### 🔄 Intelligent Deadline Sync
- **Auto-Sync:** Paste your LMS calendar link (ICS) once, and Qoldanba keeps your deadlines up to date.
- **Smart Categorization:** Automatically distinguishes between **Exams**, **Assignments**, and **Quizzes**.
- **Visual Countdowns:** Progress bars and time-remaining indicators (e.g., "2 days 4 hours remaining") help you prioritize.

### 📅 Dynamic Class Schedule
- **Group-Based Timetable:** View your weekly schedule tailored to your specific student group.
- **Real-Time Status:** See exactly where you need to be right now.

### 🚀 Modern Student Experience
- **Clean UI:** Built with [shadcn/ui](https://ui.shadcn.com/) for a professional look.
- **Dark Mode:** Easy on the eyes for late-night study sessions.
- **Responsive:** Works perfectly on desktop and mobile.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Realtime)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/qoldanba.git
    cd qoldanba
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
