const codeExecutor = require('../services/codeExecutor');

const executeCode = async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body;
    if (!language || !code) {
      return res.status(400).json({ message: 'Language and code are required' });
    }

    const result = await codeExecutor.execute(language, code, stdin);
    res.json(result);
  } catch (error) {
    console.error('Execute code error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCodeHistory = async (req, res) => {
  res.json([]);
};

module.exports = { executeCode, getCodeHistory };
