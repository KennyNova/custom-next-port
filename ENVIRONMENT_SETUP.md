# 🔧 Environment Variables Setup

## 📝 **What You Need to Create**

### **1. Local Development (.env.local)**
Create this file in your project root:

```bash
# File: .env.local (create this file)

# Production MongoDB Atlas with your new user
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@port.ca4zksq.mongodb.net/portfolio-blog?retryWrites=true&w=majority

# Replace YOUR_USERNAME and YOUR_PASSWORD with the credentials you just created in MongoDB Atlas
```

### **2. Vercel Production Environment**
Add this in Vercel Dashboard → Settings → Environment Variables:

```
Name: MONGODB_URI
Value: mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@port.ca4zksq.mongodb.net/portfolio-blog?retryWrites=true&w=majority
Environments: ✅ Production, ✅ Preview, ✅ Development
```

---

## 🔗 **MongoDB Connection String Format**

Your connection string should look like this:
```
mongodb+srv://USERNAME:PASSWORD@port.ca4zksq.mongodb.net/portfolio-blog?retryWrites=true&w=majority
```

**Replace:**
- `USERNAME` = The username you created in MongoDB Atlas
- `PASSWORD` = The password you set for that user

**Example:**
If your username is `portfolio-reader` and password is `SecurePass123`, then:
```
mongodb+srv://portfolio-reader:SecurePass123@port.ca4zksq.mongodb.net/portfolio-blog?retryWrites=true&w=majority
```

---

## ⚠️ **Important Notes**

### **Read-Only User Limitation**
You mentioned your user only has **read permissions**. This means:

✅ **Will work:**
- Loading blog posts (`/api/blog`)
- Loading projects (`/api/projects`) 
- Reading data for display

❌ **Will NOT work:**
- Creating new blog posts (POST to `/api/blog`)
- Creating new projects (POST to `/api/projects`)
- Creating signatures (POST to `/api/signatures`)
- Any write operations

### **Solution Options:**

#### **Option A: Keep Read-Only (Recommended for now)**
- Your site will work for viewing content
- Good for security
- You can create content directly in MongoDB Atlas interface

#### **Option B: Upgrade to Read/Write User**
1. Go back to MongoDB Atlas → Database Access
2. Edit your user
3. Change permissions to **"Read and write to any database"** or **"readWrite on portfolio-blog"**
4. This allows your API endpoints to create/update content

---

## 🧪 **Testing Your Setup**

### **Step 1: Create your .env.local file**
```bash
# In your project root, create .env.local
echo 'MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@port.ca4zksq.mongodb.net/portfolio-blog?retryWrites=true&w=majority"' > .env.local

# Replace YOUR_USERNAME and YOUR_PASSWORD with your actual credentials
```

### **Step 2: Test the connection**
```bash
# Test production database connection
npm run test-prod
```

### **Step 3: Start development server**
```bash
npm run dev
```

### **Step 4: Test your APIs**
- Visit: `http://localhost:3000/api/blog`
- Should return your 3 blog posts
- Visit: `http://localhost:3000/api/projects`
- Should return projects or empty array

---

## 🔒 **Current MongoDB Connection Logic**

Your app already has the correct logic in `src/lib/db/mongodb.ts`:

```typescript
// ✅ Already implemented - no changes needed
const uri = process.env.MONGODB_URI!

// Works for both development and production
export async function getDatabase(): Promise<Db> {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not configured.')
  }
  const client = await clientPromise
  return client.db('portfolio-blog')
}
```

**This means:**
- ✅ Development: Uses `MONGODB_URI` from `.env.local`
- ✅ Production: Uses `MONGODB_URI` from Vercel environment variables
- ✅ Same code works in both environments
- ✅ No additional logic needed!

---

## 🚀 **Quick Setup Commands**

```bash
# 1. Create your .env.local file (replace with your actual credentials)
cat > .env.local << EOF
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@port.ca4zksq.mongodb.net/portfolio-blog?retryWrites=true&w=majority
EOF

# 2. Test the connection
npm run test-prod

# 3. Start development
npm run dev

# 4. Test your site
# Visit: http://localhost:3000
# Check: http://localhost:3000/api/blog
```

---

## 📋 **Checklist**

- [ ] MongoDB Atlas user created with username/password
- [ ] User has appropriate permissions (read-only or read/write)
- [ ] Network access allows `0.0.0.0/0` 
- [ ] `.env.local` file created with correct connection string
- [ ] Vercel environment variables configured
- [ ] Local testing successful
- [ ] APIs returning data

---

## 🎯 **What to Tell Me**

Please share:
1. **Your MongoDB username** (the one you created)
2. **Whether you want read-only or read/write permissions**
3. **Any error messages** you get when testing

I can then give you the exact connection string to use! 🚀
