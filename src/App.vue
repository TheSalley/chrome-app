  <template>
    <div class="w-[300px] h-[350px] px-[20px] py-[10px] bg-gray-50 shadow-lg">
      <div class="flex items-center mb-4">
        <span >表单自动填充1234</span> 
        <SwitchCom /> 
      </div>
      <div class=" items-center ">
        <span >检查全站按钮是否有效</span>
        <!-- <SwitchCom />  -->
         <CheckButtons/>
        <!-- <button><span class="text">RUN</span><span>Disable!</span></button> -->
      </div>
    </div>
  </template>
  <script setup>
  import SwitchCom from '@/components/SwitchCom.vue';
import CheckButtons from './components/CheckButtons.vue';
  </script>
  <style scoped>
  .section-title {
  font-family: 'Orbitron', sans-serif; /* 科技感字体 */
  font-size: 15px;
  font-weight: 700;
  color: #111827; 
  letter-spacing: 0.5px;
  text-transform: uppercase; /* 全大写（看起来更科幻） */
}
  :host {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #1f2937; /* gray-800 */
}

/* 按钮通用风格 */
button {
  position: relative;
  overflow: hidden;
  border: 1px solid #18181a;
  color: #18181a;
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  border-radius: 10px;
  transition: all 0.3s ease;
  user-select: none;
}

button:hover {
  background: #18181a;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

button span:last-child {
  margin-left: 6px;
  font-size: 13px;
  opacity: 0.7;
}
  /* From Uiverse.io by e-coders */ 
  /* button {
  position: relative;
  overflow: hidden;
  border: 1px solid #18181a;
  color: #18181a;
  display: inline-block;
  font-size: 15px;
  line-height: 15px;
  padding: 18px 18px 17px;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  }

  button span:first-child {
  position: relative;
  transition: color 600ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 10;
  }

  button span:last-child {
  color: white;
  display: block;
  position: absolute;
  bottom: 0;
  transition: all 500ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 100;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform: translateY(225%) translateX(-50%);
  height: 14px;
  line-height: 13px;
  }

  button:after {
  content: "";
  position: absolute;
  bottom: -50%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  transform-origin: bottom center;
  transition: transform 600ms cubic-bezier(0.48, 0, 0.12, 1);
  transform: skewY(9.3deg) scaleY(0);
  z-index: 50;
  }

  button:hover:after {
  transform-origin: bottom center;
  transform: skewY(9.3deg) scaleY(2);
  }

  button:hover span:last-child {
  transform: translateX(-50%) translateY(-50%);
  opacity: 1;
  transition: all 900ms cubic-bezier(0.48, 0, 0.12, 1);
  } */
  </style>