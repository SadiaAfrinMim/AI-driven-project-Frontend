# AI Suggester

**AI-Powered Product Recommendation & Marketplace Platform**

A modern full-stack platform that uses **intelligent AI** to help users discover the right products easily. 

Just select a category (or type a description) → Get highly relevant recommendations powered by smart Title + Category matching.

🔗 **Live Demo**: [https://ai-project-flax-ten.vercel.app](https://ai-project-flax-ten.vercel.app)

---

## ✨ Key Features

### 🤖 Intelligent AI Recommendations (Our Strongest Feature)
- **Category-First AI**: Simply select any category from the dropdown and get relevant products instantly — **no query needed**
- **Smart Title Matching**: When you type something, the AI gives **top priority** to products whose titles best match your words (within the selected category)
- **Two Smart Quick Sections** (auto-updated with category):
  - **Top Rated in Category** — Highest rated products from your chosen category
  - **New Arrivals in Category** — Latest products added in that category
- Clean & Controlled: Suggestions only appear when you click **Generate Suggestions**

### 🛍️ Complete Marketplace Experience
- Modern product browsing with filters and search
- Detailed product pages with real customer reviews
- Shopping cart + one-click "Buy Now" functionality
- Product selection system with Manager/Admin approval flow

### 👥 Role-Based Platform
- **Regular Users**: Browse, review products, manage profile & cart
- **Managers**: Approve user selections, manage inventory
- **Admins**: Full control over users, roles, and content

### 👤 Excellent User Experience
- Beautiful profile with **Cloudinary** image upload (updates live in Navbar)
- Write reviews manually or let AI generate them for you
- Fully responsive design — works perfectly on mobile, tablet & desktop

### 🧠 Powerful AI Tools
- AI-generated reviews
- Smart content generation (title, description, tags)
- Natural language AI commands
- Multiple backend AI services

### 🎨 Modern & Polished Design
- Clean UI built with Tailwind + shadcn/ui
- Highly responsive Navbar with beautiful animated dropdowns
- Smooth interactions and professional feel throughout

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod

**Backend**
- Node.js + Express
- Prisma + PostgreSQL
- Cloudinary (image uploads)
- JWT Authentication

**AI Integration**
- Custom AI service with multiple providers
- Smart scoring system (Title + Category as top priority)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Ai-product-suggestion

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Setup environment variables
# Copy .env.example and fill in values

# Run database migrations
cd backend && npx prisma migrate dev

# Start development servers
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm run dev
```

---

## 📌 Important Notes

- AI Recommendations are **category-first**:
  - When you select a category from the dropdown, only products from that category are shown.
  - Title matching is used for extra relevance when a query is provided.
- The system works even without typing a query — just select a category and click **Generate Suggestions**.

---

## 📸 Screenshots

> (Add screenshots of homepage AI section, product listing, profile, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js and AI**

If you like this project, consider giving it a ⭐ on GitHub!
