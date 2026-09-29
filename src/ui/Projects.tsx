import type { CSSProperties } from 'react'
import { profile, projects, type Project } from '../data/profile'
import { Icon } from './Icon'
import { Keycap } from './Keycap'

export function Projects() {
  return (
    <>
      <p className="lede">Machine-learning systems, agent tooling and full-stack apps, newest first.</p>
      <ol className="projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} n={i + 1} />
        ))}
      </ol>
      <div className="sheet-foot">
        <Keycap href={profile.github} target="_blank" rel="noopener noreferrer" color="#232327" ink="#fff">
          <Icon name="github" size={17} />
          More on GitHub
          <Icon name="arrow" size={14} />
        </Keycap>
      </div>
    </>
  )
}

function ProjectCard({ p, n }: { p: Project; n: number }) {
  return (
    <li className="project">
      <div className="project-media">
        {p.image ? (
          <img src={p.image} alt={`Screenshot of ${p.title}`} loading="lazy" decoding="async" />
        ) : (
          <Cover p={p} />
        )}
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span>{String(n).padStart(2, '0')}</span>
          <span aria-hidden>/</span>
          <span>{p.year}</span>
          {p.nda && (
            <span className="badge">
              <Icon name="lock" size={11} /> NDA
            </span>
          )}
        </div>
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
        {p.highlights && (
          <ul className="highlights">
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        <ul className="tags" aria-label="Built with">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="project-actions">
          {p.link ? (
            <Keycap href={p.link} target="_blank" rel="noopener noreferrer" size="sm">
              <Icon name="github" size={15} />
              View on GitHub
              <Icon name="arrow" size={12} />
            </Keycap>
          ) : p.nda ? (
            <span className="locked">
              <Icon name="lock" size={14} /> Confidential: code and data are under NDA
            </span>
          ) : null}
        </div>
      </div>
    </li>
  )
}

/** Keycap-style cover for projects without a screenshot. */
function Cover({ p }: { p: Project }) {
  const word = p.title.split(' ')[0].toUpperCase().slice(0, 6)
  return (
    <div className="cover" style={{ '--accent': p.accent ?? '#f2701b' } as CSSProperties} aria-hidden>
      <div className="cover-keys">
        {word.split('').map((ch, i) => (
          <span className="kc kc-lg kc-static" key={i} style={{ '--kc': '#f4f2ee', '--kc-ink': '#7c6cf0' } as CSSProperties}>
            <span className="kc-top">{ch}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
