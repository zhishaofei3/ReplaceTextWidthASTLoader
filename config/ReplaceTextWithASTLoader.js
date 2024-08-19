const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');

module.exports = function (source) {
  console.log('zsf 我来了');
  const options = this.getOptions();
  const enTranslations = options.enTranslations;
  const zhTranslations = options.zhTranslations;

  const ast = babel.parseSync(source, {
    sourceType: 'module',
    plugins: ['@babel/plugin-syntax-jsx']
  });

  const findKeyByValue = (obj, value) => {
    return Object.keys(obj).find(key => obj[key] === value);
  };

  traverse(ast, {
    StringLiteral(path) {
      const text = path.node.value.trim();
      const key = findKeyByValue(zhTranslations, text);
      console.log('zsf text, key', text, key);
      if (key && enTranslations[key]) {
        console.log('zsf 找到了', key, '替换为', enTranslations[key]);
        path.node.value = enTranslations[key];
      }
    },
    JSXText(path) {
      const text = path.node.value.trim();
      const key = findKeyByValue(zhTranslations, text);
      if (key && enTranslations[key]) {
        path.node.value = enTranslations[key];
      }
    },
    JSXAttribute(path) {
      if (types.isStringLiteral(path.node.value)) {
        const text = path.node.value.value.trim();
        const key = findKeyByValue(zhTranslations, text);
        if (key && enTranslations[key]) {
          path.node.value.value = enTranslations[key];
        }
      }
    },
    JSXExpressionContainer(path) {
      if (types.isStringLiteral(path.node.expression)) {
        const text = path.node.expression.value.trim();
        const key = findKeyByValue(zhTranslations, text);
        if (key && enTranslations[key]) {
          path.node.expression.value = enTranslations[key];
        }
      }
    },
    TemplateLiteral(path) {
      path.node.quasis.forEach((quasi) => {
        const text = quasi.value.raw.trim();
        const key = findKeyByValue(zhTranslations, text);
        if (key && enTranslations[key]) {
          quasi.value.raw = enTranslations[key];
          quasi.value.cooked = enTranslations[key];
        }
      });
    }
  });

  const { code } = babel.transformFromAstSync(ast, source, {
    sourceType: 'module',
    plugins: ['@babel/plugin-syntax-jsx']
  });

  console.log('zsf 最终code', code);

  return code;
};