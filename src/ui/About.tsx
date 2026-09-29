import { education, experience, mailto, profile, skills, spoken } from '../data/profile'
import { Icon } from './Icon'
import { Keycap } from './Keycap'

export function About() {
  return (
    <div className="about">
      <section className="about-intro">
        <p className="hello">Hi, I’m Jalil.</p>
        <p>
          I’m a software and AI engineer, currently doing my MEng in Computer Science at Cornell Tech.
          Before that I studied Statistics and Computer Science at McGill, where I worked on ML and data-science
          projects with Michelin and IATA and did reinforcement-learning research. I’ve also shipped software at
          Deloitte and IOMETE (YC W22).
        </p>
        <div className="contact-row">
          <Keycap href={mailto} color="#f2701b" ink="#fff">
            <Icon name="mail" size={16} /> Email me
          </Keycap>
          <Keycap href={profile.linkedin} target="_blank" rel="noopener noreferrer" color="#0a66c2" ink="#fff">
            <span className="in-mark">in</span> LinkedIn
          </Keycap>
          <Keycap href={profile.github} target="_blank" rel="noopener noreferrer" color="#232327" ink="#fff">
            <Icon name="github" size={16} /> GitHub
          </Keycap>
          <Keycap href={profile.resume} target="_blank" rel="noopener noreferrer" color="#2f7a66" ink="#fff">
            <Icon name="doc" size={16} /> Resume
          </Keycap>
        </div>
      </section>

      <section aria-labelledby="xp">
        <h3 id="xp" className="section-title">
          Experience
        </h3>
        <ol className="timeline">
          {experience.map((r) => (
            <li key={r.org + r.when}>
              <div className="when">{r.when}</div>
              <div>
                <div className="role">
                  <strong>{r.org}</strong>
                  <span>{r.role}</span>
                </div>
                <ul>
                  {r.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="about-grid">
        <section aria-labelledby="edu">
          <h3 id="edu" className="section-title">
            Education
          </h3>
          <ul className="edu">
            {education.map((e) => (
              <li key={e.school}>
                <strong>{e.school}</strong>
                <span>{e.degree}</span>
                <span className="when">{e.when}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="skills">
          <h3 id="skills" className="section-title">
            Skills
          </h3>
          {Object.entries(skills).map(([group, list]) => (
            <div className="skill-group" key={group}>
              <span className="skill-label">{group}</span>
              <ul className="tags">
                {list.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="skill-group">
            <span className="skill-label">Speaks</span>
            <ul className="tags">
              {spoken.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
