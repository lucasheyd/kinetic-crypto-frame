\# ⚡ Kinetic Crypto Frame



Interactive AI crypto analyst for Warpcast. Users can get personalized crypto insights, market analysis, and trading tips directly in their Warpcast feed.



\## 🚀 Quick Start (5 minutes)



\### 1. Clone \& Setup

```bash

git clone https://github.com/your-username/kinetic-crypto-frame

cd kinetic-crypto-frame

npm install

npm run setup  # Creates .env file

```



\### 2. Configure Environment

Edit `.env` file:

```bash

\# Required: Get from https://crestal.network

CRESTAL\_API\_KEY=your\_actual\_crestal\_key



\# Required: Your deployment URL

BASE\_URL=https://your-domain.com



\# Optional: Crestal API endpoints (defaults provided)

CRESTAL\_API\_URL\_CHATS=https://open.service.crestal.network/v1/chat/completions

```



\### 3. Test Locally

```bash

npm start

\# Visit http://localhost:3000

```



\### 4. Deploy to Production

```bash

\# Option A: Vercel (Recommended)

npx vercel --prod



\# Option B: Railway

railway up



\# Option C: Heroku

heroku create your-app-name

git push heroku main

```



\## 🎯 Features



\### \*\*Interactive Buttons:\*\*

\- 📊 \*\*Market Analysis\*\* - Real-time crypto insights

\- 🚨 \*\*Breaking News\*\* - Latest crypto developments  

\- 💡 \*\*Trading Tips\*\* - AI-powered trading advice

\- 🎯 \*\*Ask Question\*\* - Direct Q\&A with AI analyst



\### \*\*AI Capabilities:\*\*

\- GPT-4 powered responses

\- Real-time market data integration

\- Professional crypto analysis

\- Risk assessment and DYOR reminders



\### \*\*Analytics:\*\*

\- User interaction tracking

\- Question analytics

\- Performance monitoring

\- Real-time stats dashboard



\## 📊 Usage \& Costs



\### \*\*Crestal Caps:\*\*

\- ~20-30 caps per user interaction

\- Only triggered by actual user engagement

\- Much more efficient than broadcasting bots



\### \*\*Expected Usage:\*\*

\- 100 users/day ≈ 2,500 caps

\- 500 users/day ≈ 12,500 caps

\- Better ROI than posting bots



\## 🛠️ Configuration



\### \*\*Environment Variables:\*\*



| Variable | Required | Description | Default |

|----------|----------|-------------|---------|

| `CRESTAL\_API\_KEY` | ✅ | Your Crestal API key | - |

| `BASE\_URL` | ✅ | Your deployment URL | - |

| `CRESTAL\_API\_URL\_CHATS` | ❌ | Crestal chat endpoint | Auto-detected |

| `PORT` | ❌ | Server port | 3000 |

| `DEBUG\_MODE` | ❌ | Enable debug logging | false |

| `ENABLE\_ANALYTICS` | ❌ | Track interactions | true |



\### \*\*Deployment URLs:\*\*

\- \*\*Vercel\*\*: `https://your-app.vercel.app`

\- \*\*Railway\*\*: `https://your-app.up.railway.app`  

\- \*\*Heroku\*\*: `https://your-app.herokuapp.com`



\## 📱 Testing Your Frame



\### \*\*1. Local Testing:\*\*

```bash

npm start

curl http://localhost:3000/health

```



\### \*\*2. Frame Validation:\*\*

\- Use \[Warpcast Frame Validator](https://warpcast.com/~/developers/frames)

\- Test meta tags and button interactions

\- Verify image loading



\### \*\*3. Live Testing:\*\*

1\. Deploy to production

2\. Create Warpcast post with your frame URL

3\. Test all button interactions

4\. Ask questions to test AI responses



\## 📊 Monitoring



\### \*\*Analytics Dashboard:\*\*

```bash

\# View real-time stats

curl https://your-domain.com/analytics



\# Or visit in browser

https://your-domain.com/analytics

```



\### \*\*Health Check:\*\*

```bash

curl https://your-domain.com/health

```



\### \*\*Log Monitoring:\*\*

\- Check deployment platform logs (Vercel/Railway/Heroku)

\- Monitor Crestal API usage in dashboard

\- Track user engagement patterns



\## 🎯 Going Viral



\### \*\*Launch Strategy:\*\*

1\. \*\*Test Thoroughly\*\* - Ensure all interactions work

2\. \*\*Create Launch Post\*\* - Showcase cool AI responses

3\. \*\*Share in Communities\*\* - Crypto Discord/Telegram groups

4\. \*\*Engage Actively\*\* - Respond to frame interactions

5\. \*\*Iterate Based on Usage\*\* - Add features users request



\### \*\*Example Launch Post:\*\*

```

🚀 Just launched Kinetic Crypto AI Analyst on Warpcast!



Get personalized crypto insights powered by GPT-4:

📊 Real-time market analysis  

🚨 Breaking news alerts

💡 Trading tips \& strategies

🎯 Ask any crypto question



Try it now! ⚡

```



\## 🔧 Customization



\### \*\*Add New Features:\*\*

```javascript

// In server.js, add new button handler

case 5: // New Feature

&nbsp; const response = await askCrestalAgent("Your new prompt here");

&nbsp; return {

&nbsp;   image: `${baseUrl}/images/frame-new.png`,

&nbsp;   text: response,

&nbsp;   buttons: \['Option 1', 'Option 2', '← Back']

&nbsp; };

```



\### \*\*Customize AI Responses:\*\*

Edit the system prompt in `askCrestalAgent()` function to change AI personality and capabilities.



\### \*\*Add Custom Images:\*\*

\- Create 1200x630px images for each frame state

\- Upload to `/public/images/` directory

\- Update image URLs in button handlers



\## 🚨 Troubleshooting



\### \*\*Common Issues:\*\*



\*\*Frame not loading:\*\*

\- Check `BASE\_URL` is correct in .env

\- Verify meta tags with frame validator

\- Ensure server is running and accessible



\*\*AI responses not working:\*\*

\- Verify `CRESTAL\_API\_KEY` is correct

\- Check Crestal dashboard for remaining caps

\- Enable `DEBUG\_MODE=true` for detailed logs



\*\*Buttons not responding:\*\*

\- Check POST endpoint `/api/frame` is working

\- Verify button click handling in server.js

\- Test with curl or Postman



\### \*\*Debug Mode:\*\*

```bash

\# Enable debug logging

DEBUG\_MODE=true npm start



\# Check detailed API responses and errors

```



\## 📈 Scaling



\### \*\*High Traffic Optimization:\*\*

\- Add Redis for analytics storage

\- Implement rate limiting

\- Use CDN for image serving

\- Add response caching



\### \*\*Premium Features:\*\*

\- Portfolio analysis

\- Real-time alerts

\- Advanced charting

\- Subscription management



\## 🤝 Contributing



1\. Fork the repository

2\. Create feature branch

3\. Add tests for new features

4\. Submit pull request



\## 📄 License



MIT License - feel free to customize and deploy your own version!



\## 🆘 Support



\- \*\*Issues\*\*: Open GitHub issue

\- \*\*Questions\*\*: Create discussion

\- \*\*Updates\*\*: Follow development progress



---



\*\*Built with ⚡ by FractalSwarm Technology\*\*



\*Turn your crypto knowledge into an interactive AI experience!\*

