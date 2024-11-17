<template>
  <div id="AIChatView">
    <!-- 居中显示标题 -->
    <h2 class="chat-title">AI助手聊天界面</h2>

    <!-- 聊天窗口 -->
    <div class="chat-window">
      <a-list>
        <template v-for="(item, index) in messages" :key="index">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <div class="message-container">
                  <div class="message-header">
                    <span class="sender-name">{{ item.sender }}</span>
                  </div>
                  <span v-if="item.time" class="message-time">
                    {{ formatTime(item.time) }}
                  </span>
                </div>
              </template>
              <template #description>{{ item.text }}</template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <!-- AI 等待响应时显示动画和提示 -->
      <div v-if="isWaitingForAI" class="loading-indicator">
        <p>齐小艾 正在思考，请耐心等待...</p>
        <span class="dot-flashing"></span>
      </div>
    </div>

    <a-divider size="0" />

    <!-- 输入和发送消息的表单 -->
    <a-form layout="inline" class="input-form">
      <a-form-item style="flex: 1">
        <a-input
          v-model="newMessage"
          placeholder="请输入消息..."
          @keyup.enter="sendMessage"
          class="custom-input"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="sendMessage" class="custom-button">
          发送
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import message from "@arco-design/web-vue/es/message";
import moment from "moment";
import { QuestionControllerService } from "../../../generated";
import store from "@/store";

// 存储聊天记录
const messages = ref<Array<{ sender: string; text: string; time?: string }>>(
  []
);

// 用户输入的新消息
const newMessage = ref<string>("");

// AI 响应状态
const isWaitingForAI = ref(false);

// 发送消息方法
const sendMessage = async () => {
  if (newMessage.value.trim() !== "") {
    // 将用户消息加入聊天记录
    const now = moment().format("YYYY-MM-DDTHH:mm:ss");
    messages.value.push({
      sender: store.state.user.loginUser.userName,
      text: newMessage.value,
      time: now,
    });

    // 获取用户输入的消息
    const request = newMessage.value;

    // 清空输入框
    newMessage.value = "";

    // 设置 AI 正在响应状态
    isWaitingForAI.value = true;

    try {
      // 发送消息给后端
      const response =
        await QuestionControllerService.getChatResponseUsingPost1(request);

      // 检查响应码
      if (response.code === 0) {
        // 将 AI 响应消息加入聊天记录
        messages.value.push({
          sender: "齐小艾",
          text: response.data ?? "",
        });
      } else if (response.code === 50030) {
        // 在其他地方调用
        store.dispatch("user/getLoginUser");
      } else {
        message.error(response.message ?? "获取 AI 响应失败");
      }
    } catch (error) {
      console.error("获取 AI 响应失败", error);
      messages.value.push({
        sender: "齐小艾",
        text: "抱歉，我无法处理您的请求。",
      });
    } finally {
      // 关闭 AI 响应状态
      isWaitingForAI.value = false;
    }
  } else {
    message.warning("请输入消息");
  }
};

// 格式化时间
const formatTime = (time: string) => {
  return moment(time).format("YYYY-MM-DD HH:mm");
};

onMounted(async () => {
  // 从后端加载历史消息的逻辑
  try {
    let response = await QuestionControllerService.getChatRecordUsingGet1();
    let historyMessages = response.data;
    if (response.code === 50030) {
      store.dispatch("user/getLoginUser");
      response = await QuestionControllerService.getChatRecordUsingGet1();
      historyMessages = response.data;
    }

    if (historyMessages && historyMessages.length > 0) {
      // 将后端数据映射到 messages 所需的格式
      const formattedMessages: {
        sender: string;
        text: string;
        time?: string | undefined;
      }[] = [];
      historyMessages.forEach((item) => {
        if (item.userRequest) {
          formattedMessages.push({
            sender: item.userName ?? "未知",
            text: item.userRequest ?? "",
            time: formatTime(item.createTime ?? ""),
          });
        }
        if (item.aiResponse) {
          formattedMessages.push({
            sender: "齐小艾",
            text: item.aiResponse ?? "",
          });
        }
      });

      messages.value = formattedMessages;
    } else {
      // 如果没有历史记录，添加打招呼消息
      messages.value.push({
        sender: "齐小艾",
        text: "您好，有什么我可以帮忙的吗？",
      });
    }
  } catch (error) {
    console.error("加载历史消息失败", error);
  }
});
</script>

<style scoped>
.custom-input {
  background-color: #f0f8ff; /* Set the background color for the input field */
  border-radius: 8px; /* Add rounded corners */
  padding: 10px; /* Add padding */
  height: 40px; /* Ensure consistent height */
}

/* Separate styling for the send button */
.custom-button {
  background-color: #1890ff; /* Set the background color for the send button */
  border-radius: 8px; /* Add rounded corners */
  padding: 10px 16px; /* Add padding */
  color: #fff; /* Set the text color */
  height: 40px; /* Ensure consistent height with the input field */
  border: none; /* Remove border */
}

.input-form .a-form-item {
  margin-bottom: 0; /* Remove spacing between form items */
}

#AIChatView {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.chat-title {
  text-align: center;
  margin-bottom: 20px;
}

.chat-window {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  background: linear-gradient(to bottom, #f5f5f5, #ffffff);
}

.message-container {
  position: relative;
  padding-left: 0;
}

.message-header {
  display: inline-block;
}

.message-time {
  position: absolute;
  left: 560px; /* 固定距离聊天框左侧的距离 */
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #888;
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  white-space: nowrap;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
}

/* Loading indicator for AI response */
.loading-indicator {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  color: #666;
}

.loading-indicator p {
  margin: 0;
}

.dot-flashing {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  margin-left: 4px;
  animation: dot-flashing 1s infinite alternate;
}

@keyframes dot-flashing {
  0% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
