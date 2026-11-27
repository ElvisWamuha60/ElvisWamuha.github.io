# Elvis Wamuha Gitau - German Tutor & Software Developer

My portfolio website: **https://ElvisWamuha60.github.io**

German lessons for levels **A1, A2 and B1** at **KES 1,500 per 2 hours**.
Contact: gitauelvis60@gmail.com | 0141 910 084

---

## What is in this project

| File | What it does |
|---|---|
| `index.html` | The content of the page: headings, text, links and contact details |
| `style.css` | How the page looks: colours, fonts, layout, hover effects, mobile view |
| `script.js` | The reviews feature: showing, adding and deleting reviews |
| `profile.JPG` | My profile photo |
| `README.md` | This guide |

All four website files must stay together in the main list of the repository (not inside a folder). Keep the file names exactly as they are, including the capital letters in `profile.JPG`.

---

## How to change things

Every change is made the same way:

1. Open the repository on GitHub and click the file you want to edit.
2. Click the **pencil icon** (top right of the code).
3. Press **Ctrl + F** to search for the text you want to change.
4. Click **Commit changes** (twice, to confirm).
5. Wait about 1 minute, then refresh the site with **Ctrl + Shift + R**.

### Common changes

| I want to change... | File | Search for |
|---|---|---|
| Number of students taught | `index.html` | `Students taught` |
| Price | `index.html` | `KES 1,500` |
| Phone number | `index.html` | `0141 910 084` (also change the `tel:` and `wa.me` links) |
| Email | `index.html` and `script.js` | `gitauelvis60@gmail.com` |
| German proverbs | `index.html` | `class="prov"` |
| Levels taught | `index.html` | `class="level"` |
| Colours | `style.css` | `:root` (top of the file) |
| Profile photo | upload a new image named `profile.JPG` | - |

### Checking that an update worked

Open the **Actions** tab in the repository. A green check mark next to the latest "pages build and deployment" means the site was updated.

---

## Reviews (Firebase)

Visitors write reviews on the page. They are saved in a free Google Firebase database, so everyone who visits can see them.

- **See reviews:** console.firebase.google.com, open the project, then **Firestore Database > Data > reviews**.
- **Delete a review:** click the review, open the three-dot menu on the document, then **Delete document**.
- **Visitors can delete their own review** with the "Delete my review" button, but only on the same device and browser they wrote it on.
- **Check the list every few days** for spam or rude comments, because reviews appear without approval.

Settings are at the top of `script.js`:

```
PROJECT_ID  - the Firebase project ID
API_KEY     - the Firebase web API key
```

Do not change these unless the Firebase project changes.

### Security rules

The rules in **Firestore Database > Rules** let anyone read reviews and add a review, and only allow the writer to delete it. If the database is ever recreated, the rules must be pasted in again and published. Create the database as **Standard edition** (not Enterprise).

---

## Backups and safety

- Keep a copy of all the files in one folder on your computer and in Google Drive.
- Every change on GitHub is saved. Click a file, then **History**, to see or restore an older version.
- Keep your GitHub and Firebase logins safe and turn on two-step verification.

---

## Built with

- HTML, CSS and JavaScript (no frameworks)
- Google Fonts: Fraunces and DM Sans
- GitHub Pages for hosting
- Firebase (Firestore and anonymous sign-in) for shared reviews
