module.exports = app => {
    app.get('/api/events', async (req, res) => {
        try {//
            const { Event } = global.getMongooseModels(['Event']);
            const events = await Event.find().sort({ timestamp: -1 }).limit(50);
            res.json(events);
        } catch (error) {
            console.log({error})
            res.status(500).json({ error: 'Error fetching events' });
        }
    });
}