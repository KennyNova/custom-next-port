# Database Migration Guide

This guide helps you safely copy your development database to production.

## Option 1: Using the Migration Script (Recommended)

1. **Run the migration script:**
   ```bash
   node scripts/migrate-db.js
   ```

2. **The script will:**
   - Create a backup of your production data
   - Show you what data exists in both databases
   - Copy all data from dev to production
   - Provide verification

## Option 2: Manual Migration Using MongoDB Tools

### Step 1: Export Development Data
```bash
# Export your development database
mongodump --host localhost:27017 --db portfolio-blog --out ./dev-backup

# Or export specific collections
mongoexport --host localhost:27017 --db portfolio-blog --collection projects --out projects.json
mongoexport --host localhost:27017 --db portfolio-blog --collection blogPosts --out blogPosts.json
```

### Step 2: Import to Production
```bash
# Import using connection string (replace with your actual URI)
mongorestore --uri "mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/" --db portfolio-blog ./dev-backup/portfolio-blog

# Or import specific collections
mongoimport --uri "mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/" --db portfolio-blog --collection projects --file projects.json
mongoimport --uri "mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/" --db portfolio-blog --collection blogPosts --file blogPosts.json
```

## Option 3: Using MongoDB Compass (GUI)

1. **Connect to Development Database:**
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Navigate to `portfolio-blog` database

2. **Export Collections:**
   - For each collection (projects, blogPosts), click "Export Data"
   - Save as JSON files

3. **Connect to Production Database:**
   - Connect to `mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/`
   - Navigate to `portfolio-blog` database

4. **Import Collections:**
   - For each collection, click "Import Data"
   - Select your exported JSON files

## After Migration

1. **Update Vercel Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/portfolio-blog
   ```

2. **Redeploy your Vercel application**

3. **Test your deployed site:**
   - Check that projects load: `https://your-domain.vercel.app/api/projects`
   - Check that blog posts load: `https://your-domain.vercel.app/api/blog`
   - Verify the home page shows content

## Troubleshooting

### Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas (or allow 0.0.0.0/0)
- Verify the connection string is correct
- Check that the database user has read/write permissions

### Missing MongoDB Tools
Install MongoDB Tools if you don't have them:
```bash
# macOS
brew install mongodb/brew/mongodb-database-tools

# Windows
# Download from https://www.mongodb.com/try/download/database-tools

# Linux
sudo apt-get install mongodb-database-tools
```

### Script Permissions
If you get permission errors:
```bash
chmod +x scripts/migrate-db.js
```

## Verification Commands

After migration, verify your data:

```bash
# Check production database using MongoDB shell
mongosh "mongodb+srv://navidm4598:rqkq0lFMTjzR6fFZ@port.ca4zksq.mongodb.net/"

# In the MongoDB shell:
use portfolio-blog
db.projects.countDocuments()
db.blogPosts.countDocuments()
db.projects.findOne()
db.blogPosts.findOne()
```
