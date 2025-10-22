const dns = require('dns');
const url = require('url');
const path = require('path');
const { Counter, URLModel, getNextSequence } = require('../DB/Model');
const express = require('express');
const router = express.Router();

router.post('/api/shorturl', async (req, res) => {
    const originalUrl = req.body.url;

    try {
        const parsed = new URL(originalUrl);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return res.json({ error: 'invalid url' });
        }

        // DNS lookup on hostname to validate domain exists
        const hostname = parsed.hostname;
        dns.lookup(hostname, async (err/*, address, family */) => {
            if (err) {
                // DNS lookup failed -> invalid url
                return res.json({ error: 'invalid url' });
            }

            // Check if URL already stored
            const found = await URLModel.findOne({ original_url: originalUrl }).exec();
            if (found) {
                return res.json({ original_url: found.original_url, short_url: found.short_url });
            }

            // Create new entry with auto-increment short_url
            const nextSeq = await getNextSequence('url_count');
            const newUrl = new URLModel({ original_url: originalUrl, short_url: nextSeq });
            await newUrl.save();
            return res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url });
        });
    } catch (error) {
        return res.json({ error: 'invalid url' });
    }
});

router.get('/api/shorturl/:short', async (req, res) => {
    const short = Number(req.params.short);
    if (Number.isNaN(short)) {
        return res.status(400).json({ error: 'Wrong format' });
    }

    const found = await URLModel.findOne({ short_url: short }).exec();
    if (!found) {
        return res.json({ error: 'No short URL found for the given input' });
    }
    // Redirect to the original URL
    return res.redirect(found.original_url);
});

module.exports = router;