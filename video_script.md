# PulseCRM AI - Video Presentation Script (Easy English Version)

> [!TIP]
> **Total Estimated Time:** ~5:30
> **Target Word Count:** ~750 words
> **Setup Required:** Have your local servers running (`backend`, `frontend`, `channel-service`). Have the web browser open to the local frontend. Open VS Code with `backend/src/services/aiService.ts` ready to show.

---

## 1. Product Intro (0:00 - 0:45)
**Visual (Screen):** Start on the PulseCRM Dashboard (Overview page with charts). Move your mouse gently over the screen.

**Audio (Voiceover):**
"Hi everyone, welcome to the demo of PulseCRM AI. 

Normally, marketing tools can be very hard to use. You often need to know complex computer code or SQL just to find the right customers. Plus, you need writers to create every email or text message. 

PulseCRM AI changes all of that. It is an AI-first tool. This means you just use plain, everyday English to do your work. Whether you want to find VIP customers who might leave, or you need to write a new message for a sale, PulseCRM handles the hard parts so you can focus on your marketing strategy. Let me show you how it works."

---

## 2. Functional Demo (0:45 - 2:30)
**Visual (Screen):** 
1. Go to the **Segments** page. 
2. Open the **AI Segment Builder** and type: *"Find customers who spent over $500 but haven't ordered recently."* Click generate.
3. Show the list of customers that appears and the AI's suggestions. 
4. Go to the **Campaigns** tab and start a campaign for those customers.
5. Quickly show the **Dashboard** where the charts are updating live.

**Audio (Voiceover):**
"Let’s start with finding customers. Instead of clicking through confusing menus, I just tell the AI what I want: *'Find customers who spent over $500 but haven't ordered recently.'* 

Right away, the AI understands this and safely asks our database for this exact list of people. It finds the customers, tags them, and even suggests good ways to win them back before I even hit save.

Next, let's create a campaign. I can ask the AI to write a message based on my goals. I can preview what the message will look like on a phone screen right here in the browser. 

After launching the campaign, we go to the Analytics Dashboard. Here, you can see our charts updating live. As messages are sent out, you can watch the delivery numbers and clicks go up in real-time."

---

## 3. Technical Architecture (2:30 - 3:30)
**Visual (Screen):** Show a slide or the Architecture diagram from `explanation.md`. Point to the Frontend, Main Backend, and Channel Service.

**Audio (Voiceover):**
"Now let's talk about how this works behind the scenes. We built a very strong system that can handle a lot of traffic safely. 

Our frontend—what you see on the screen—is built with modern tools like React and Vite. This makes it look great and run very fast. 

Our main backend, which is like the brain, uses Node.js. It talks to our database, which is MongoDB, and to Google Gemini, which is our AI. 

The smartest part of our setup is the 'Channel Service'. If we tried to send 100,000 text messages at the exact same time, our main system would crash. To fix this, we created a separate background worker to handle sending the messages. It processes them smoothly, waits if there are network issues, and reports back safely. This keeps the main CRM running perfectly without slowing down."

---

## 4. Code Walkthrough (3:30 - 4:30)
**Visual (Screen):** Open VS Code. Show the folders (`backend/src/...`). Open the file `backend/src/services/aiService.ts`. Scroll through the code slowly.

**Audio (Voiceover):**
"Let’s take a quick look at the code. To keep things clean and easy to read, we separated different parts of our backend. 

If we look at the file `aiService.ts`, this is where the AI magic happens. When you type a request, the system passes it here. We use the Google Gemini API to figure out what you want. Notice how we keep the AI part separate from the database code. This makes our code much easier to manage and update."

---

## 5. AI-Native Workflow & Security (4:30 - 5:30)
**Visual (Screen):** Stay in VS Code, or show the manual fallback UI in the Segment Builder on the browser.

**Audio (Voiceover):**
"A big problem with AI is security. What if the AI makes a mistake and tries to run a bad command on our database?

We solved this by giving the AI strict rules. We tell Gemini to never write direct database code. Instead, it just gives us a simple list of rules, like 'Field: Total Spent, Rule: Greater Than 500'. 

Our backend checks these rules to make sure they are 100% safe before doing anything. If the AI makes a mistake, our system catches it and stops it. 

Also, if the AI service ever stops working, our app has a backup 'manual mode'. So, the CRM will always keep working and your business never stops."

---

## 6. Conclusion (5:30 - 5:45)
**Visual (Screen):** Back to the main dashboard or a final slide with your name and contact info.

**Audio (Voiceover):**
"In short, PulseCRM connects complex data with an easy-to-use interface. By combining a strong technical setup with Google Gemini, we've built a smart, fast, and safe tool for marketers. Thank you for watching!"
