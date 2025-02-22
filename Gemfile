source "https://rubygems.org"

# Jekyll version management
# Uncomment and set the version if needed
# gem "jekyll", "~> 4.4.1"

# Default theme for Jekyll sites
gem "minima"

# GitHub Pages support
# If using GitHub Pages, it provides the required dependencies and plugins
gem "github-pages", group: :jekyll_plugins

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-default-layout"
  gem "jekyll-titles-from-headings"
  gem "jekyll-sitemap"
  gem "jekyll-gist"
end

# Windows and JRuby compatibility
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance booster for Windows
gem "wdm", "~> 0.1", platforms: [:mingw, :x64_mingw, :mswin]

# JRuby compatibility for http_parser.rb
gem "http_parser.rb", "~> 0.6.0", platforms: [:jruby]
