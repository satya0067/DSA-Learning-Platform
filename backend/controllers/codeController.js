const Code = require('../models/Code');
const codeExecutor = require('../services/codeExecutor');

const executeCode = async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body;
    if (!language || !code) {
      return res.status(400).json({ message: 'Language and code are required' });
    }

    const result = await codeExecutor.execute(language, code, stdin);

    const codeData = {
      language,
      code,
      output: result.output,
      status: result.status,
      input: stdin,
    };

    if (req.user && req.user.id) {
      codeData.userId = req.user.id;
      const codeRecord = new Code(codeData);
      await codeRecord.save();
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCodeHistory = async (req, res) => {
  try {
    const history = await Code.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { executeCode, getCodeHistory };
