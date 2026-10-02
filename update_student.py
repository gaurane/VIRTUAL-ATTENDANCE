import re

with open("src/app/page.js", "r") as f:
    content = f.read()

# Add googleForm state
content = content.replace(
    'const [status, setStatus] = useState("idle"); // idle, loading, success, error',
    'const [status, setStatus] = useState("idle");\n  const [googleForm, setGoogleForm] = useState("");\n'
)

# In handleCheckIn, we already do const settings = await getSettings();
# Wait, I can just fetch it on mount so it's always available.

use_effect = """
  useEffect(() => {
    getSettings().then(settings => {
      if(settings && settings.googleFormLink) setGoogleForm(settings.googleFormLink);
    });
  }, []);
"""

content = content.replace(
    'const filteredStudents = MOCK_STUDENTS',
    use_effect + '\n  const filteredStudents = MOCK_STUDENTS'
)

# Add a button at the bottom of the checkin form or success state
google_btn = """
        {googleForm && (
          <div style={{marginTop: 30, textAlign: "center"}}>
            <a href={googleForm} target="_blank" className="btn btn-secondary">Fill out Workshop Feedback Form</a>
          </div>
        )}
      </div>
"""

content = content.replace('      </div>\n    </div>', google_btn + '    </div>')

with open("src/app/page.js", "w") as f:
    f.write(content)
