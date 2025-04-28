<?php
// Set the base URL of your website
$base_url = "https://pronouns.wiki"; 

// Function to recursively scan all files in a directory
function scan_directory($directory) {
    $files = [];
    $items = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

    foreach ($items as $item) {
        if ($item->isFile()) {
            // Filter for .php, .html, or other files you want to include
            if (in_array($item->getExtension(), ['php', 'html'])) {
                $filePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $item->getPathname());
                $files[] = $filePath; 
            }
        }
    }
    return $files;
}

// Scan the current directory (or set to any path you need)
$pages = scan_directory($_SERVER['DOCUMENT_ROOT']); 

// Create an XML document
$dom = new DOMDocument('1.0', 'UTF-8');
$urlset = $dom->createElement('urlset');
$urlset->setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
$dom->appendChild($urlset);

// Loop through each detected file and add it to the sitemap
foreach ($pages as $page) {
    // Exclude any unwanted files, like admin pages, error pages, etc.
    if (strpos($page, 'tools') !== false || strpos($page, 'error') !== false) {
        continue;
    }
    
    $url_element = $dom->createElement('url');
    
    // Ensure the correct URL format
    $loc = $dom->createElement('loc', htmlspecialchars($base_url . $page));
    $url_element->appendChild($loc);
    
    // Last modified time of the file
    $lastmod = $dom->createElement('lastmod', date('Y-m-d', filemtime($_SERVER['DOCUMENT_ROOT'] . $page)));
    $url_element->appendChild($lastmod);
    
    // Set change frequency and priority
    $changefreq = $dom->createElement('changefreq', 'weekly');
    $url_element->appendChild($changefreq);
    
    $priority = $dom->createElement('priority', '0.8');
    $url_element->appendChild($priority);
    
    $urlset->appendChild($url_element);
}

// Save the sitemap to the root directory as sitemap.xml
$dom->save($_SERVER['DOCUMENT_ROOT'] . '/sitemap.xml');

// Output success message
echo "Sitemap generated successfully!";
?>