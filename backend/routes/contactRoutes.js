const express = require('express');
const router = express.Router();
const contactService = require('../service/contactService');
const authMiddleware = require('../middleware/auth');
const { validate, contactSchema } = require('../middleware/validate');

router.use(authMiddleware);

// GET /api/contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await contactService.getContacts(req.user.id, req.query.search);
        res.status(200).json({ success: true, count: contacts.length, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/contacts
router.post('/', validate(contactSchema), async (req, res) => {
    try {
        const contact = await contactService.createContact(req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Contact created successfully.', data: contact });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /api/contacts/:id - Update contact (Validated by Zod)
router.put('/:id', validate(contactSchema), async (req, res) => {
    try {
        const updated = await contactService.updateContact(req.user.id, req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Contact updated successfully.', data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await contactService.deleteContact(req.user.id, req.params.id);
        res.status(200).json({ success: true, message: `Contact '${deleted.name}' deleted successfully.` });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
});

// POST /api/contacts/reset-demo - Load sample contacts
router.post('/reset-demo', async (req, res) => {
    try {
        const contacts = await contactService.resetDemoContacts(req.user.id);
        res.status(200).json({ success: true, message: 'Sample contacts loaded!', data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
