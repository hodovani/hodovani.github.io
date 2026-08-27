---
layout: projects
title: Projects
permalink: /projects/
---

<p class="projects-lead">
  Selected engineering projects, interactive prototypes, and production-style workflows.
</p>

<div class="projects-grid">
  {% assign project_pages = site.pages | where_exp: "item", "item.project" | sort: "date" | reverse %}
  {% for item in project_pages %}
  <article class="project-card">
    <div class="project-card-header">
      <h2 class="project-title">
        <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
      </h2>
      {% if item.date %}
      <time class="project-date" datetime="{{ item.date | date_to_xmlschema }}" style="font-size: 0.85rem; color: #6b7280;">
        {{ item.date | date: "%B %Y" }}
      </time>
      {% endif %}
    </div>
    <p class="project-description">
      {{ item.project.description }}
    </p>
    {% if item.project.tags %}
    <div class="project-tags" aria-label="Project Tags">
      {% for tag in item.project.tags %}
      <span class="tag">{{ tag }}</span>
      {% endfor %}
    </div>
    {% endif %}
    <div class="project-links">
      <a class="btn-link" href="{{ item.url | relative_url }}">Interactive App &rarr;</a>
      {% if item.project.source_path %}
      <a class="btn-link secondary" href="https://github.com/{{ site.repository }}/tree/master/{{ item.project.source_path }}" target="_blank" rel="noopener noreferrer">Source Code &rarr;</a>
      {% endif %}
    </div>
  </article>
  {% endfor %}
</div>
