const Contact = require('../db/Contact');

const contactService = {
  // Get all contacts for a user with optional search query
  async getContacts(userId, searchQuery) {
    let query = { user: userId };

    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), 'i');
      query.$and = [
        { user: userId },
        { $or: [{ name: regex }, { email: regex }, { phone: regex }] },
      ];
      delete query.user;
    }

    return Contact.find(query).sort({ createdAt: -1 });
  },

  // Create a contact (data is pre-validated by Zod)
  async createContact(userId, { name, email, phone }) {
    return Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      user: userId,
    });
  },

  // Update a contact (data is pre-validated by Zod)
  async updateContact(userId, contactId, { name, email, phone }) {
    const updated = await Contact.findOneAndUpdate(
      { _id: contactId, user: userId },
      { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() },
      { new: true }
    );

    if (!updated) {
      throw new Error('Contact not found.');
    }
    return updated;
  },

  // Delete a contact
  async deleteContact(userId, contactId) {
    const deleted = await Contact.findOneAndDelete({ _id: contactId, user: userId });
    if (!deleted) {
      throw new Error('Contact not found.');
    }
    return deleted;
  },

  // Reset sample contacts for a user
  async resetDemoContacts(userId) {
    await Contact.deleteMany({ user: userId });

    const samples = [
      { name: 'Alex Rivera', email: 'alex.rivera@techcorp.io', phone: '9876543210', user: userId },
      { name: 'Sophia Chen', email: 'sophia.chen@designlab.co', phone: '9810234567', user: userId },
      { name: 'Marcus Vance', email: 'marcus.v@innovate.org', phone: '9823456789', user: userId },
      { name: 'Emily Watson', email: 'emily.watson@cloudnet.net', phone: '9912345678', user: userId },
      { name: 'David Patel', email: 'david.patel@fintech.dev', phone: '9834567890', user: userId },
    ];

    return Contact.insertMany(samples);
  },
};

module.exports = contactService;
