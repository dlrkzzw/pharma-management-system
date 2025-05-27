import http from 'http';

// 测试配置
const config = {
  frontend: 'http://localhost:8080',
  backend: 'http://localhost:3001',
  timeout: 5000
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 日志函数
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// HTTP请求工具
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: config.timeout
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// 测试用例
const tests = [
  // 1. 服务可用性测试
  {
    name: '前端服务可用性',
    test: async () => {
      const response = await makeRequest(config.frontend);
      if (response.statusCode === 200 && (response.data.includes('医药代表管理系统') || response.data.includes('<!doctype html>'))) {
        return { success: true, message: '前端服务正常运行' };
      }
      throw new Error(`前端服务异常: ${response.statusCode}`);
    }
  },
  {
    name: '后端服务可用性',
    test: async () => {
      const response = await makeRequest(`${config.backend}/api/health`);
      if (response.statusCode === 200) {
        return { success: true, message: '后端服务正常运行' };
      }
      throw new Error(`后端服务异常: ${response.statusCode}`);
    }
  },

  // 2. API功能测试
  {
    name: '员工管理API测试',
    test: async () => {
      // 创建测试员工
      const createResponse = await makeRequest(`${config.backend}/api/employees`, {
        method: 'POST',
        body: {
          name: '测试员工',
          employee_id: 'TEST001',
          phone: '13800138000',
          email: 'test@example.com',
          role: 'sales',
          status: 'active',
          hire_date: '2024-01-01'
        }
      });

      if (createResponse.statusCode !== 201) {
        throw new Error(`创建员工失败: ${createResponse.statusCode}`);
      }

      const employeeId = createResponse.data.id;

      // 查询员工
      const getResponse = await makeRequest(`${config.backend}/api/employees/${employeeId}`);
      if (getResponse.statusCode !== 200) {
        throw new Error(`查询员工失败: ${getResponse.statusCode}`);
      }

      // 更新员工
      const updateResponse = await makeRequest(`${config.backend}/api/employees/${employeeId}`, {
        method: 'PUT',
        body: {
          name: '测试员工-更新',
          employee_id: 'TEST001',
          phone: '13800138001',
          email: 'test@example.com',
          role: 'sales',
          status: 'active',
          hire_date: '2024-01-01'
        }
      });

      if (updateResponse.statusCode !== 200) {
        throw new Error(`更新员工失败: ${updateResponse.statusCode}`);
      }

      // 删除员工
      const deleteResponse = await makeRequest(`${config.backend}/api/employees/${employeeId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.statusCode !== 200) {
        throw new Error(`删除员工失败: ${deleteResponse.statusCode}`);
      }

      return { success: true, message: '员工管理API测试通过' };
    }
  },

  {
    name: '药品管理API测试',
    test: async () => {
      // 创建测试药品
      const createResponse = await makeRequest(`${config.backend}/api/medicines`, {
        method: 'POST',
        body: {
          name: '测试药品',
          specification: '10mg*30片',
          manufacturer: '测试制药厂',
          approval_number: 'TEST123456',
          current_cost_price: 50.00,
          suggested_price: 80.00,
          stock_quantity: 100,
          safety_stock: 20
        }
      });

      if (createResponse.statusCode !== 201) {
        throw new Error(`创建药品失败: ${createResponse.statusCode}`);
      }

      const medicineId = createResponse.data.id;

      // 查询药品列表
      const listResponse = await makeRequest(`${config.backend}/api/medicines`);
      if (listResponse.statusCode !== 200) {
        throw new Error(`查询药品列表失败: ${listResponse.statusCode}`);
      }

      // 删除测试药品
      await makeRequest(`${config.backend}/api/medicines/${medicineId}`, {
        method: 'DELETE'
      });

      return { success: true, message: '药品管理API测试通过' };
    }
  },

  {
    name: '医院管理API测试',
    test: async () => {
      // 创建测试医院
      const createResponse = await makeRequest(`${config.backend}/api/hospitals`, {
        method: 'POST',
        body: {
          name: '测试医院',
          address: '测试地址123号',
          phone: '010-12345678',
          contact_person: '张主任',
          level: '三甲',
          credit_level: 'A'
        }
      });

      if (createResponse.statusCode !== 201) {
        throw new Error(`创建医院失败: ${createResponse.statusCode}`);
      }

      const hospitalId = createResponse.data.id;

      // 删除测试医院
      await makeRequest(`${config.backend}/api/hospitals/${hospitalId}`, {
        method: 'DELETE'
      });

      return { success: true, message: '医院管理API测试通过' };
    }
  }
];

// 运行测试
async function runTests() {
  log.info('开始运行自动化测试...\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.info(`运行测试: ${test.name}`);
      const result = await test.test();
      log.success(`${test.name} - ${result.message}`);
      passed++;
    } catch (error) {
      log.error(`${test.name} - ${error.message}`);
      failed++;
    }
    console.log(''); // 空行分隔
  }

  // 测试结果汇总
  console.log('='.repeat(50));
  log.info(`测试完成! 通过: ${passed}, 失败: ${failed}`);

  if (failed === 0) {
    log.success('🎉 所有测试都通过了!');
  } else {
    log.warning(`⚠️  有 ${failed} 个测试失败，请检查相关功能`);
  }

  return { passed, failed };
}

// 启动测试
runTests().catch(error => {
  log.error(`测试运行失败: ${error.message}`);
  process.exit(1);
});
