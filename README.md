# סיכום אשכולות מפורום פרוג - ProGist

תוסף זה מאפשר למשתמשים לייצא אשכולות שלמים מפורום פרוג (כולל דיונים מרובי עמודים) לקובץ JSON, ולסכם אותם באמצעות מודלי שפה כמו ChatGPT.

## 🌟 תכונות עיקריות

- **ייצוא מלא**: משיכת כל הפוסטים, הכותבים, התאריכים והציטוטים מכל עמודי האשכול.
- **סיכום אוטומטי**: קישור ישיר למודל שפה כמו ChatGPT עם הנחיות מותאמות אישית לסיכום הדיון.
- **התאמה אישית**:
  - אפשרות בחירת שפת הסיכום (עברית או אנגלית).
  - התאמת משקל לפוסטים לפי דרגת המשתמש (מתחילים, מתקדמים, מומחים).
  - הפקת סטטיסטיקות מתקדמות כמו כמות פוסטים, מספר משתמשים פעילים ואורכי פוסטים.
  - הוספת הערות מיוחדות לסיכום.
- **מעקב התקדמות**: סרגל התקדמות אינטראקטיבי שמציג את תהליך עיבוד העמודים.

## 📦 התקנה

1. יש להוריד את קוד המקור מהריפוזיטוריון.
2. בדפדפן (Chrome או Edge):
   - גלוש לכתובת `chrome://extensions/`.
   - הפעל את "מצב מפתחים" בפינה הימנית העליונה.
   - לחץ על "טען הרחבה לא ארוזה" ובחר את תיקיית הפרויקט.
     
## ⚙️ טכנולוגיות בשימוש

- שימוש ב-Manifest V3 להתאמה מלאה לסטנדרטים העדכניים של דפדפן Chrome.
- שמירת הגדרות משתמש בזמן אמת באמצעות Local Storage.
- מיצוי נתונים מתקדם ממבנה HTML של הפורום באמצעות DOM Parsing.
- שימוש ב-Chrome Scripting API לעבודה עם טאבים וב-ChatGPT API לסיכום תוכן.

## 📌 הערות חשובות

- התוסף עובד אך ורק בכתובות של פורום פרוג בפורמט `https://www.prog.co.il/threads/*`.
- נתוני המשתמשים נשמרים באופן מקומי בלבד ואינם נשלחים לשרתים חיצוניים.

## 🤝 תרומה

הפרויקט פתוח לתרומות, וניתן:

- לדווח על באגים באמצעות [Issues].
- להציע שיפורי קוד באמצעות [Pull Requests].
- לתרום אייקונים או עיצובים נוספים לפרויקט.

---

**רישיון**: [MIT](LICENSE)  
**גרסה נוכחית**: 1.0  
**מפתחים**: [Israel Blasbalg](https://github.com/israelbls/) ו- [Naftaly](https://github.com/naftaly16)
