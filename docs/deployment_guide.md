# WorkTrace - Free Deployment Guide

এই গাইডে **WorkTrace** প্রোজেক্টটিকে সম্পূর্ণ বিনামূল্যে ইন্টারনেটে লাইভ করার বিস্তারিত ধাপগুলো দেওয়া হলো।

---

## ধাপ ১: GitHub-এ কোড আপলোড করা
যেহেতু আমরা আলাদা আলাদা সার্ভিসে ফ্রন্টএন্ড এবং ব্যাকএন্ড হোস্ট করব, তাই কোডগুলো গিটহাবে রাখা জরুরি।

1. `github.com`-এ যান এবং **worktrace-backend** এবং **worktrace-frontend** নামে দুটি আলাদা রিপোজিটরি তৈরি করুন (অথবা একটি রিপোজিটরিতে আলাদা ফোল্ডারে রাখতে পারেন)।
2. আপনার লোকাল পিসির ব্যাকএন্ড কোডগুলো `worktrace-backend` রিপোজিটরিতে `push` করুন।
3. ফ্রন্টএন্ড কোডগুলো `worktrace-frontend` রিপোজিটরিতে `push` করুন।

---

## ধাপ ২: Database (Supabase) সেটআপ
যেহেতু আমাদের PostgreSQL ডাটাবেস দরকার, তাই আমরা Supabase ব্যবহার করব।

1. [Supabase](https://supabase.com/)-এ গিয়ে গিটহাব দিয়ে লগইন করুন।
2. **"New Project"**-এ ক্লিক করে একটি প্রোজেক্ট তৈরি করুন।
3. প্রোজেক্ট তৈরি হলে সেটিংসে গিয়ে **Database** অপশন থেকে **Connection String (URI)** কপি করে রাখুন। এটি দেখতে অনেকটা এরকম হবে: 
   `postgresql://postgres:আপনার_পাসওয়ার্ড@db.xxxxxxxx.supabase.co:5432/postgres`

---

## ধাপ ৩: Backend Deploy (Render)
লারাভেল এপিআইটি আমরা Render-এ হোস্ট করব।

1. [Render.com](https://render.com/)-এ গিটহাব দিয়ে লগইন করুন।
2. ড্যাশবোর্ড থেকে **New -> Web Service**-এ ক্লিক করুন।
3. আপনার গিটহাবের `worktrace-backend` রিপোজিটরিটি সিলেক্ট করুন।
4. **Environment:** `Docker` সিলেক্ট করুন (যেহেতু আমাদের ব্যাকএন্ডে Dockerfile আছে)।
5. **Environment Variables** সেকশনে নিচের ভ্যালুগুলো দিন:
   - `APP_ENV` = `production`
   - `APP_DEBUG` = `false`
   - `APP_URL` = `https://আপনার-render-app-এর-নাম.onrender.com`
   - `DB_CONNECTION` = `pgsql`
   - `DATABASE_URL` = `ধাপ ২ থেকে কপি করা Supabase-এর URL`
   - `SANCTUM_STATEFUL_DOMAINS` = `আপনার-vercel-app-এর-নাম.vercel.app`
   - `SESSION_DOMAIN` = `.আপনার-render-app-এর-নাম.onrender.com`
   - `FRONTEND_URL` = `https://আপনার-vercel-app-এর-নাম.vercel.app` (পরবর্তীতে আপডেট করতে হবে)
6. **"Create Web Service"**-এ ক্লিক করুন। ডেপ্লয় হয়ে গেলে Render আপনাকে ব্যাকএন্ডের একটি লিংক দেবে (যেমন: `worktrace-api.onrender.com`)।

> [!NOTE]
> Render-এর কনসোলে (Shell) ঢুকে একবার `php artisan migrate --force` রান করে নিতে হবে ডাটাবেসের টেবিলগুলো তৈরি করার জন্য।

---

## ধাপ ৪: Frontend Deploy (Vercel)
React অ্যাপটি আমরা Vercel-এ হোস্ট করব।

1. [Vercel](https://vercel.com/)-এ গিটহাব দিয়ে লগইন করুন।
2. **"Add New Project"**-এ ক্লিক করে আপনার গিটহাবের `worktrace-frontend` রিপোজিটরিটি ইমপোর্ট করুন।
3. **Environment Variables** সেকশনে ক্লিক করুন এবং নিচের ভ্যালুটি দিন:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://আপনার-render-app-এর-নাম.onrender.com/api/v1` (Render থেকে পাওয়া ব্যাকএন্ড লিংক)
4. **"Deploy"** বাটনে ক্লিক করুন। 
5. ২-৩ মিনিটের মধ্যেই আপনার ফ্রন্টএন্ড লাইভ হয়ে যাবে এবং Vercel আপনাকে একটি সাইট লিংক দেবে!

---

## ধাপ ৫: CORS ঠিক করা
যেহেতু ব্যাকএন্ড এবং ফ্রন্টএন্ড আলাদা ডোমেইনে আছে, তাই কানেকশন ঠিক করতে হবে।

1. Render-এর Environment Variables-এ গিয়ে `FRONTEND_URL` এবং `SANCTUM_STATEFUL_DOMAINS` এর ভ্যালুতে আপনার Vercel-এর লাইভ লিংকটি বসিয়ে দিন।
2. Render অ্যাপটি রিস্টার্ট করুন।

---

**অভিনন্দন! 🎉** আপনার WorkTrace প্রোজেক্টটি এখন সম্পূর্ণ ফ্রিতে ইন্টারনেটে লাইভ এবং বিশ্বের যেকোনো প্রান্ত থেকে ব্যবহার করার জন্য প্রস্তুত!
